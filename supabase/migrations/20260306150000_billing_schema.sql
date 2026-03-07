-- Billing & Invoicing Schema

-- 1. Custom Types
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'SENT', 'PAID', 'VOID', 'OVERDUE');

-- 2. Invoices Table
CREATE TABLE invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status invoice_status DEFAULT 'DRAFT',
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Invoice Items
CREATE TABLE invoice_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Triggers for updated_at
CREATE TRIGGER update_invoices_modtime BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Row Level Security (RLS)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Viewable by ADMIN and BILLING
CREATE POLICY "Billing staff can view invoices" ON invoices FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'BILLING')));

CREATE POLICY "Billing staff can view invoice items" ON invoice_items FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'BILLING')));

-- All clinical staff can see invoices for their patients? (Maybe just view, not edit)
CREATE POLICY "Clinical staff can view patient invoices" ON invoices FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('AMDMIN', 'DOCTOR', 'NURSE')));

-- 7. Seed Data (Optional, but helpful for initial load)
-- Since I don't have patient IDs easily in a script, I'll rely on the UI or manual inserts if needed.
-- However, for the dashboard to look good immediately, I'll add a few sample invoices if patients exist.
DO $$
DECLARE
    p_id UUID;
BEGIN
    SELECT id INTO p_id FROM patients LIMIT 1;
    IF p_id IS NOT NULL THEN
        INSERT INTO invoices (patient_id, amount, status, due_date)
        VALUES (p_id, 1500.00, 'PAID', NOW() - INTERVAL '10 days'),
               (p_id, 250.00, 'SENT', NOW() + INTERVAL '5 days');
    END IF;
END $$;
