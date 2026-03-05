-- EHCP Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Custom Types & Enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'SPECIALIST', 'COMPLIANCE', 'BILLING', 'LAB_TECH');
CREATE TYPE patient_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE patient_status AS ENUM ('INTAKE', 'TRIAGED', 'WAITING', 'IN_CONSULTATION', 'LABS_PENDING', 'TREATMENT_PLAN', 'DISCHARGED');
CREATE TYPE appointment_status AS ENUM ('SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- 2. Global Utilities
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Core Tables

-- Profiles (Sync with auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role user_role DEFAULT 'NURSE',
    avatar_url TEXT,
    specialty TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients
CREATE TABLE patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mrn TEXT UNIQUE NOT NULL, -- Medical Record Number
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT,
    blood_type TEXT,
    status patient_status DEFAULT 'INTAKE',
    priority patient_priority DEFAULT 'MEDIUM',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MRN Auto-generator
CREATE SEQUENCE mrn_seq START 1000;
CREATE OR REPLACE FUNCTION generate_mrn() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.mrn := 'MRN-' || nextval('mrn_seq');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_mrn
BEFORE INSERT ON patients
FOR EACH ROW
WHEN (NEW.mrn IS NULL)
EXECUTE FUNCTION generate_mrn();

-- Patient Allergies
CREATE TABLE patient_allergies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    allergen TEXT NOT NULL,
    severity TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triage Vitals
CREATE TABLE triage_vitals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    checked_by UUID REFERENCES profiles(id),
    heart_rate INTEGER,
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    temperature DECIMAL(4,1),
    oxygen_saturation INTEGER,
    respiratory_rate INTEGER,
    pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Body Map Hotspots
CREATE TABLE body_map_hotspots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    x_coord DECIMAL(10,5) NOT NULL,
    y_coord DECIMAL(10,5) NOT NULL,
    z_coord DECIMAL(10,5) NOT NULL,
    label TEXT NOT NULL,
    severity patient_priority DEFAULT 'MEDIUM',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES profiles(id),
    appointment_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status appointment_status DEFAULT 'SCHEDULED',
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Triggers for updated_at
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_modtime BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_modtime BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_map_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Lab Results & Orders
CREATE TABLE lab_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    ordered_by UUID REFERENCES profiles(id),
    test_name TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, REVIEWED
    priority patient_priority DEFAULT 'MEDIUM',
    result_data JSONB,
    result_pdf_url TEXT,
    sla_deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Treatment Plans
CREATE TABLE treatment_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'DRAFT', -- DRAFT, ACTIVE, COMPLETED, SUSPENDED
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plan Medications
CREATE TABLE plan_medications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plan_id UUID REFERENCES treatment_plans(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    route TEXT, -- Oral, IV, etc.
    interactions_checked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drug Interaction Matrix (Static/Reference)
CREATE TABLE drug_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    drug_a TEXT NOT NULL,
    drug_b TEXT NOT NULL,
    severity TEXT NOT NULL, -- CRITICAL, WARNING, MODERATE
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    old_value JSONB,
    new_value JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for remaining tables
CREATE TRIGGER update_lab_orders_modtime BEFORE UPDATE ON lab_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_treatment_plans_modtime BEFORE UPDATE ON treatment_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Refined RLS Policies

-- Lab Orders: Viewable by clinical staff and lab techs
CREATE POLICY "Clinical staff can view lab orders" ON lab_orders FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST', 'LAB_TECH')));

-- Treatment Plans: Viewable by clinical staff
CREATE POLICY "Clinical staff can view treatment plans" ON treatment_plans FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST')));

-- Drug Interactions: Viewable by clinical staff
CREATE POLICY "Clinical staff can view interactions" ON drug_interactions FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE', 'SPECIALIST')));

-- Audit Logs: Viewable only by ADMIN and COMPLIANCE
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'COMPLIANCE')));
