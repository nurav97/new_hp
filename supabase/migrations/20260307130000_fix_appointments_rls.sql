-- Fix for appointments RLS: Allow clinical staff to manage appointments
-- This ensures that doctors, nurses, and receptionists can successfully schedule and view appointments.

-- 1. SELECT Policy: Clinical staff can view all appointments
CREATE POLICY "Clinical staff can view appointments" ON appointments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'SPECIALIST')
    )
);

-- 2. INSERT Policy: Clinical staff can schedule new appointments
CREATE POLICY "Clinical staff can insert appointments" ON appointments
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'SPECIALIST')
    )
);

-- 3. UPDATE Policy: Clinical staff can modify appointments
CREATE POLICY "Clinical staff can update appointments" ON appointments
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'SPECIALIST')
    )
);

-- 4. DELETE Policy: Admins can delete appointments
CREATE POLICY "Admins can delete appointments" ON appointments
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'ADMIN'
    )
);
