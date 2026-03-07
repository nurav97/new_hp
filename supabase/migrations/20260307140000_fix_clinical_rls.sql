-- Comprehensive RLS fix for Treatment Plans and Clinical Data
-- This ensures that doctors, nurses, and clinical staff can perform their duties across all medical modules.
-- idempotent: using DROP POLICY IF EXISTS before CREATE POLICY.

-- 1. Patients Table
DROP POLICY IF EXISTS "Clinical staff can insert patients" ON patients;
CREATE POLICY "Clinical staff can insert patients" ON patients FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'))
);

DROP POLICY IF EXISTS "Clinical staff can update patients" ON patients;
CREATE POLICY "Clinical staff can update patients" ON patients FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'))
);

DROP POLICY IF EXISTS "Clinical staff can select patients" ON patients;
CREATE POLICY "Clinical staff can select patients" ON patients FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'SPECIALIST', 'LAB_TECH', 'BILLING'))
);

-- 2. Treatment Plans
DROP POLICY IF EXISTS "Clinical staff can insert treatment plans" ON treatment_plans;
CREATE POLICY "Clinical staff can insert treatment plans" ON treatment_plans FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST'))
);

DROP POLICY IF EXISTS "Clinical staff can update treatment plans" ON treatment_plans;
CREATE POLICY "Clinical staff can update treatment plans" ON treatment_plans FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST'))
);

DROP POLICY IF EXISTS "Clinical staff can view treatment plans" ON treatment_plans;
-- Redefine selection if needed (already in initial_schema or elsewhere, making sure it stays)
CREATE POLICY "Clinical staff can view treatment plans" ON treatment_plans FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST'))
);

-- 3. Plan Medications
DROP POLICY IF EXISTS "Clinical staff can select plan medications" ON plan_medications;
CREATE POLICY "Clinical staff can select plan medications" ON plan_medications FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST'))
);

DROP POLICY IF EXISTS "Clinical staff can insert plan medications" ON plan_medications;
CREATE POLICY "Clinical staff can insert plan medications" ON plan_medications FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST'))
);

DROP POLICY IF EXISTS "Clinical staff can update plan medications" ON plan_medications;
CREATE POLICY "Clinical staff can update plan medications" ON plan_medications FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST'))
);

-- 4. Lab Orders
DROP POLICY IF EXISTS "Clinical staff can insert lab orders" ON lab_orders;
CREATE POLICY "Clinical staff can insert lab orders" ON lab_orders FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST', 'LAB_TECH'))
);

DROP POLICY IF EXISTS "Clinical staff can update lab orders" ON lab_orders;
CREATE POLICY "Clinical staff can update lab orders" ON lab_orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST', 'LAB_TECH'))
);

-- 5. Body Map Hotspots
DROP POLICY IF EXISTS "Clinical staff can select hotspots" ON body_map_hotspots;
CREATE POLICY "Clinical staff can select hotspots" ON body_map_hotspots FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST'))
);

DROP POLICY IF EXISTS "Clinical staff can insert hotspots" ON body_map_hotspots;
CREATE POLICY "Clinical staff can insert hotspots" ON body_map_hotspots FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST'))
);

DROP POLICY IF EXISTS "Clinical staff can update hotspots" ON body_map_hotspots;
CREATE POLICY "Clinical staff can update hotspots" ON body_map_hotspots FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST'))
);

-- 6. Triage Vitals
DROP POLICY IF EXISTS "Clinical staff can select vitals" ON triage_vitals;
CREATE POLICY "Clinical staff can select vitals" ON triage_vitals FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST'))
);

DROP POLICY IF EXISTS "Clinical staff can insert vitals" ON triage_vitals;
CREATE POLICY "Clinical staff can insert vitals" ON triage_vitals FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST'))
);

DROP POLICY IF EXISTS "Clinical staff can update vitals" ON triage_vitals;
CREATE POLICY "Clinical staff can update vitals" ON triage_vitals FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST'))
);

-- 7. Audit Logging (Ensure consistency)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON audit_logs;
CREATE POLICY "Admins can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);
