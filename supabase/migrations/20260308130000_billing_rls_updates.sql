-- Billing RLS Updates and Audit Triggers

-- 1. Allow Billing/Admin to Insert and Update Invoices
DROP POLICY IF EXISTS "Billing staff can insert invoices" ON invoices;
CREATE POLICY "Billing staff can insert invoices" ON invoices 
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'BILLING')));

DROP POLICY IF EXISTS "Billing staff can update invoices" ON invoices;
CREATE POLICY "Billing staff can update invoices" ON invoices 
FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'BILLING')));

-- 2. Allow Billing/Admin to Insert and Update Invoice Items
DROP POLICY IF EXISTS "Billing staff can insert invoice items" ON invoice_items;
CREATE POLICY "Billing staff can insert invoice items" ON invoice_items 
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'BILLING')));

DROP POLICY IF EXISTS "Billing staff can update invoice items" ON invoice_items;
CREATE POLICY "Billing staff can update invoice items" ON invoice_items 
FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'BILLING')));

-- 3. Audit Trigger for Invoices
DROP TRIGGER IF EXISTS trigger_audit_invoices ON invoices;
CREATE TRIGGER trigger_audit_invoices
AFTER INSERT ON invoices
FOR EACH ROW EXECUTE FUNCTION log_clinical_action();
