-- EHCP RLS FIX & CLINICAL DATA APPLICATION
-- Instructions: 
-- 1. Ensure you have run `node supabase/seed-users.mjs` first.
-- 2. Open the Supabase SQL Editor.
-- 3. Copy/Paste and RUN the following blocks.

-- BLOCK 1: MISSING RLS POLICIES
-- These allow clinical staff to actually see and interact with data.

-- 1. Profiles (Public profiles viewable by everyone in the system)
DROP POLICY IF EXISTS "Profiles are viewable by clinicians" ON profiles;
CREATE POLICY "Profiles are viewable by clinicians" ON profiles FOR SELECT 
USING (auth.role() = 'authenticated');

-- 2. Patients (Total access for clinical staff)
DROP POLICY IF EXISTS "Clinical staff can view patients" ON patients;
CREATE POLICY "Clinical staff can view patients" ON patients FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST', 'LAB_TECH', 'RECEPTIONIST')));

DROP POLICY IF EXISTS "Clinical staff can insert patients" ON patients;
CREATE POLICY "Clinical staff can insert patients" ON patients FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')));

DROP POLICY IF EXISTS "Clinical staff can update patients" ON patients;
CREATE POLICY "Clinical staff can update patients" ON patients FOR UPDATE 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')));

-- 3. Clinical Data (Vitals, Allergies, Hotspots)
DROP POLICY IF EXISTS "Clinical staff can view vitals" ON triage_vitals;
CREATE POLICY "Clinical staff can view vitals" ON triage_vitals FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST')));

DROP POLICY IF EXISTS "Clinical staff can view allergies" ON patient_allergies;
CREATE POLICY "Clinical staff can view allergies" ON patient_allergies FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST')));

DROP POLICY IF EXISTS "Clinical staff can view hotspots" ON body_map_hotspots;
CREATE POLICY "Clinical staff can view hotspots" ON body_map_hotspots FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST')));

-- 4. Operational Data (Appointments, Notifications)
DROP POLICY IF EXISTS "Staff can view appointments" ON appointments;
CREATE POLICY "Staff can view appointments" ON appointments FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')));

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT 
USING (auth.uid() = user_id);

-- BLOCK 2: APPLY UPDATED SEED DATA
-- The seed data (seed.sql) has been updated to be idempotent (will not error on duplicates).
