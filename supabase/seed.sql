-- EHCP Seed Data
-- Run this in the Supabase SQL Editor to populate with dummy clinical data.

-- 1. Create Dummy Profiles (UUIDs are updated by seed-users.mjs)
INSERT INTO profiles (id, full_name, role, specialty, avatar_url)
VALUES 
  ('57465602-28b8-443e-9e27-1b6960023ac3', 'Dr. Michael Vance', 'DOCTOR', 'Genomics & Precision Medicine', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'),
  ('41ce6df9-3aff-49d8-a72b-0ba6c1016b0b', 'Nurse Sarah Wilson', 'NURSE', 'Emergency Triage', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'),
  ('4884145f-1efb-48b9-9406-e957ba1d51d3', 'Admin Caroline', 'ADMIN', 'System Operations', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Dummy Patients
INSERT INTO patients (id, first_name, last_name, date_of_birth, gender, blood_type, status, priority)
VALUES 
  ('a1b2c3d4-e5f6-4a5b-8c9d-012345678901', 'John', 'Smith', '1985-05-12', 'Male', 'A+', 'WAITING', 'HIGH'),
  ('b2c3d4e5-f6a7-4b6c-9d0e-123456789012', 'Emma', 'Davis', '2001-02-15', 'Female', 'O-', 'TRIAGED', 'CRITICAL'),
  ('c3d4e5f6-a7b8-4c7d-0e1f-234567890123', 'Michael', 'Chen', '1978-11-03', 'Male', 'B-', 'LABS_PENDING', 'MEDIUM'),
  ('d4e5f6a7-b8c9-4d8e-1f22-345678901234', 'Sarah', 'Wilson', '1992-08-24', 'Female', 'AB+', 'INTAKE', 'LOW'),
  ('e5f6a7b8-c9d0-4e9f-2f33-456789012345', 'David', 'Miller', '1965-12-30', 'Male', 'O+', 'DISCHARGED', 'LOW'),
  ('f6a7b8c9-d0e1-4f0f-3e42-567890123456', 'Alice', 'Cooper', '1980-07-04', 'Female', 'A-', 'IN_CONSULTATION', 'HIGH'),
  ('6a7b8c9d-0e1f-40f1-2345-678901234567', 'Robert', 'Brown', '1955-03-20', 'Male', 'B+', 'WAITING', 'MEDIUM'),
  ('7b8c9d0e-1f2a-51b2-3456-789012345678', 'Tony', 'Stark', '1970-05-29', 'Male', 'A+', 'IN_CONSULTATION', 'MEDIUM'),
  ('8c9d0e1f-2a3b-62e3-4567-890123456789', 'Natasha', 'Romanoff', '1984-11-22', 'Female', 'O-', 'LABS_PENDING', 'HIGH'),
  ('9d0e1f2a-3b4c-73f4-5678-901234567890', 'Bruce', 'Banner', '1969-12-18', 'Male', 'AB-', 'TRIAGED', 'CRITICAL')
ON CONFLICT (id) DO NOTHING;

-- 3. Patient Allergies
INSERT INTO patient_allergies (id, patient_id, allergen, severity, notes)
VALUES 
  (uuid_generate_v4(), 'a1b2c3d4-e5f6-4a5b-8c9d-012345678901', 'Penicillin', 'CRITICAL', 'Anaphylactic reaction in 2018'),
  (uuid_generate_v4(), 'b2c3d4e5-f6a7-4b6c-9d0e-123456789012', 'Peanuts', 'HIGH', 'Severe hives and respiratory distress'),
  (uuid_generate_v4(), 'f6a7b8c9-d0e1-4f0f-3e42-567890123456', 'Latex', 'MEDIUM', 'Contact dermatitis')
ON CONFLICT (id) DO NOTHING;

-- 4. Triage Vitals
INSERT INTO triage_vitals (id, patient_id, heart_rate, systolic_bp, diastolic_bp, temperature, oxygen_saturation, respiratory_rate, pain_level, notes)
VALUES 
  (uuid_generate_v4(), 'a1b2c3d4-e5f6-4a5b-8c9d-012345678901', 92, 128, 82, 98.8, 98, 18, 6, 'Patient reports chronic back pain.'),
  (uuid_generate_v4(), 'b2c3d4e5-f6a7-4b6c-9d0e-123456789012', 110, 145, 95, 101.2, 94, 24, 8, 'Presenting with acute respiratory distress.'),
  (uuid_generate_v4(), 'c3d4e5f6-a7b8-4c7d-0e1f-234567890123', 75, 120, 80, 98.6, 99, 14, 2, 'Routine checkup, labs ordered for cholesterol.')
ON CONFLICT (id) DO NOTHING;

-- 5. Body Map Hotspots
INSERT INTO body_map_hotspots (id, patient_id, x_coord, y_coord, z_coord, label, severity, description)
VALUES 
  (uuid_generate_v4(), 'a1b2c3d4-e5f6-4a5b-8c9d-012345678901', 0.2, 0.5, 0.4, 'Cardiac Arrhythmia', 'HIGH', 'Abnormal sinus rhythm detected.'),
  (uuid_generate_v4(), 'a1b2c3d4-e5f6-4a5b-8c9d-012345678901', -0.3, -0.4, 0.2, 'Abdominal Pain', 'MEDIUM', 'Tenderness in lower left quadrant.'),
  (uuid_generate_v4(), 'a1b2c3d4-e5f6-4a5b-8c9d-012345678901', 0, 1.2, 0.1, 'Migraine', 'LOW', 'Recurring tension headaches.'),
  (uuid_generate_v4(), 'b2c3d4e5-f6a7-4b6c-9d0e-123456789012', 0.1, 0.8, 0.3, 'Pulmonary Edema', 'CRITICAL', 'Fluid detected in lower lungs.')
ON CONFLICT (id) DO NOTHING;

-- 6. Lab Orders
INSERT INTO lab_orders (id, patient_id, test_name, status, priority, sla_deadline)
VALUES 
  (uuid_generate_v4(), 'c3d4e5f6-a7b8-4c7d-0e1f-234567890123', 'WBC with Differential', 'COMPLETED', 'MEDIUM', NOW() + INTERVAL '2 hours'),
  (uuid_generate_v4(), 'a1b2c3d4-e5f6-4a5b-8c9d-012345678901', 'Genomic Sequencing (Panel B)', 'IN_PROGRESS', 'HIGH', NOW() + INTERVAL '24 hours'),
  (uuid_generate_v4(), '9d0e1f2a-3b4c-73f4-5678-901234567890', 'Toxicology Screen', 'PENDING', 'CRITICAL', NOW() + INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- 7. Dummy Drug Interactions
INSERT INTO drug_interactions (id, drug_a, drug_b, severity, description)
VALUES 
  (uuid_generate_v4(), 'Warfarin', 'Aspirin', 'CRITICAL', 'Increased risk of major hemorrhage.'),
  (uuid_generate_v4(), 'Atorvastatin', 'Clarithromycin', 'WARNING', 'Increased risk of rhabdomyolysis.'),
  (uuid_generate_v4(), 'Lisinopril', 'Spironolactone', 'MODERATE', 'Risk of hyperkalemia.')
ON CONFLICT (id) DO NOTHING;

-- 8. Final Audit logs for demo
INSERT INTO audit_logs (action, resource, resource_id)
VALUES 
  ('SYSTEM_INIT', 'EHCP Global', 'SYS-001'),
  ('SEED_DATA_INJECT', 'Postgres Database', 'SEED-2026');
