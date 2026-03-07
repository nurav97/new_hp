-- Lab Results Automation: Audit Logs, Notifications, and Status Sync

-- 1. Lab Orders Audit Trigger
CREATE TRIGGER trigger_audit_lab_orders
AFTER INSERT OR UPDATE ON lab_orders
FOR EACH ROW EXECUTE FUNCTION log_clinical_action();

-- 2. Lab Order Notifications Function
CREATE OR REPLACE FUNCTION notify_clinician_of_lab_order()
RETURNS TRIGGER AS $$
DECLARE
    patient_name TEXT;
    ordered_by_name TEXT;
BEGIN
    -- Get names for the notification message
    SELECT first_name || ' ' || last_name INTO patient_name
    FROM patients WHERE id = NEW.patient_id;
    
    SELECT full_name INTO ordered_by_name
    FROM profiles WHERE id = NEW.ordered_by;

    -- Notify the creator of relevant status changes (or a general lab notification)
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO notifications (
            user_id,
            title,
            message,
            type,
            link
        ) VALUES (
            NEW.ordered_by,
            'Lab Order Placed',
            'Order for ' || NEW.test_name || ' placed for ' || patient_name,
            'INFO',
            '/labs'
        );
    ELSIF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
        INSERT INTO notifications (
            user_id,
            title,
            message,
            type,
            link
        ) VALUES (
            NEW.ordered_by,
            'Lab Order Updated: ' || NEW.status,
            'Status for ' || NEW.test_name || ' (' || patient_name || ') changed to ' || NEW.status,
            CASE WHEN NEW.status = 'COMPLETED' THEN 'SUCCESS' ELSE 'INFO' END,
            '/labs'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Notification Trigger
CREATE TRIGGER trigger_notify_lab_order
AFTER INSERT OR UPDATE ON lab_orders
FOR EACH ROW EXECUTE FUNCTION notify_clinician_of_lab_order();

-- 3. Patient Status Sync for Lab Orders
CREATE OR REPLACE FUNCTION sync_patient_lab_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update patient status to LABS_PENDING when a new order is created
    UPDATE patients
    SET status = 'LABS_PENDING',
        updated_at = NOW()
    WHERE id = NEW.patient_id
    AND status NOT IN ('LABS_PENDING', 'IN_CONSULTATION', 'TREATMENT_PLAN', 'DISCHARGED');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach status sync trigger
CREATE TRIGGER trigger_sync_lab_status
AFTER INSERT ON lab_orders
FOR EACH ROW EXECUTE FUNCTION sync_patient_lab_status();
