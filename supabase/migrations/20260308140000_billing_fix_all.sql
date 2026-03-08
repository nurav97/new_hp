-- Consolidated Billing Fix (Table + RLS + Triggers)

-- 1. Create Types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
        CREATE TYPE invoice_status AS ENUM ('DRAFT', 'SENT', 'PAID', 'VOID', 'OVERDUE');
    END IF;
END $$;

-- 2. Create Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status invoice_status DEFAULT 'DRAFT',
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to avoid duplicates
DROP POLICY IF EXISTS "Billing staff can view invoices" ON invoices;
DROP POLICY IF EXISTS "Billing staff can view invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Clinical staff can view patient invoices" ON invoices;
DROP POLICY IF EXISTS "Billing staff can insert invoices" ON invoices;
DROP POLICY IF EXISTS "Billing staff can update invoices" ON invoices;
DROP POLICY IF EXISTS "Billing staff can insert invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Billing staff can update invoice items" ON invoice_items;

-- 6. Create Refined RLS Policies
CREATE POLICY "Billing staff can view invoices" ON invoices FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'BILLING')));

CREATE POLICY "Billing staff can view invoice items" ON invoice_items FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'BILLING')));

CREATE POLICY "Clinical staff can view patient invoices" ON invoices FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE')));

CREATE POLICY "Billing staff can insert invoices" ON invoices 
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'BILLING')));

CREATE POLICY "Billing staff can update invoices" ON invoices 
FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'BILLING')));

CREATE POLICY "Billing staff can insert invoice items" ON invoice_items 
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'BILLING')));

CREATE POLICY "Billing staff can update invoice items" ON invoice_items 
FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'BILLING')));

-- 7. Audit Triggers
DROP TRIGGER IF EXISTS trigger_audit_invoices ON invoices;
CREATE TRIGGER trigger_audit_invoices
AFTER INSERT ON invoices
FOR EACH ROW EXECUTE FUNCTION log_clinical_action();

-- 8. Table modtime triggers
DROP TRIGGER IF EXISTS update_invoices_modtime ON invoices;
CREATE TRIGGER update_invoices_modtime BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
