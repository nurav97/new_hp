-- Backend Flows Automation: Audit Logs, Notifications, and Status Sync

-- 1. Automated Audit Logging Function
CREATE OR REPLACE FUNCTION log_clinical_action()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        resource,
        resource_id,
        new_value,
        ip_address
    ) VALUES (
        auth.uid(),
        'CREATE',
        TG_TABLE_NAME,
        NEW.id::TEXT,
        row_to_json(NEW),
        inet_client_addr()::TEXT
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Audit Triggers
CREATE TRIGGER trigger_audit_appointments
AFTER INSERT ON appointments
FOR EACH ROW EXECUTE FUNCTION log_clinical_action();

CREATE TRIGGER trigger_audit_treatment_plans
AFTER INSERT ON treatment_plans
FOR EACH ROW EXECUTE FUNCTION log_clinical_action();


-- 2. Appointment Notifications Function
CREATE OR REPLACE FUNCTION notify_doctor_of_appointment()
RETURNS TRIGGER AS $$
DECLARE
    patient_name TEXT;
BEGIN
    -- Get patient name for the notification message
    SELECT first_name || ' ' || last_name INTO patient_name
    FROM patients WHERE id = NEW.patient_id;

    INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        link
    ) VALUES (
        NEW.doctor_id,
        'New Appointment Scheduled',
        'Clinical appointment scheduled with ' || patient_name || ' for ' || to_char(NEW.appointment_time, 'Mon DD, HH24:MI'),
        'INFO',
        '/appointments'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Notification Trigger
CREATE TRIGGER trigger_notify_appointment
AFTER INSERT ON appointments
FOR EACH ROW EXECUTE FUNCTION notify_doctor_of_appointment();


-- 3. Patient Status Sync Function
CREATE OR REPLACE FUNCTION sync_patient_treatment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update patient status to TREATMENT_PLAN when a new plan is created
    UPDATE patients
    SET status = 'TREATMENT_PLAN',
        updated_at = NOW()
    WHERE id = NEW.patient_id
    AND status != 'TREATMENT_PLAN'; -- Only update if not already in that status
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Status Sync Trigger
CREATE TRIGGER trigger_sync_treatment_status
AFTER INSERT ON treatment_plans
FOR EACH ROW EXECUTE FUNCTION sync_patient_treatment_status();


-- 4. Refined RLS for Notifications
-- Ensure users can only see their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
FOR SELECT USING (auth.uid() = user_id);

-- Ensure clinical staff can create notifications (for the triggers to work if executed as user)
-- Note: SECURITY DEFINER functions run as the owner (usually admin), but good to have explicit policy if needed.
CREATE POLICY "Users can insert own notifications" ON notifications
FOR INSERT WITH CHECK (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DOCTOR', 'NURSE')
));
