-- Audit Triggers for Clinical Tables

-- Attach Audit Triggers to Patients
DROP TRIGGER IF EXISTS trigger_audit_patients ON patients;
CREATE TRIGGER trigger_audit_patients
AFTER INSERT ON patients
FOR EACH ROW EXECUTE FUNCTION log_clinical_action();

-- Attach Audit Triggers to Lab Orders
DROP TRIGGER IF EXISTS trigger_audit_lab_orders ON lab_orders;
CREATE TRIGGER trigger_audit_lab_orders
AFTER INSERT ON lab_orders
FOR EACH ROW EXECUTE FUNCTION log_clinical_action();

-- Attach Audit Triggers to Triage Vitals
DROP TRIGGER IF EXISTS trigger_audit_triage_vitals ON triage_vitals;
CREATE TRIGGER trigger_audit_triage_vitals
AFTER INSERT ON triage_vitals
FOR EACH ROW EXECUTE FUNCTION log_clinical_action();

-- Attach Audit Triggers to Notifications (optional, but good for compliance)
DROP TRIGGER IF EXISTS trigger_audit_notifications ON notifications;
CREATE TRIGGER trigger_audit_notifications
AFTER INSERT ON notifications
FOR EACH ROW EXECUTE FUNCTION log_clinical_action();

-- Attach Audit Triggers to Profiles (track new users)
DROP TRIGGER IF EXISTS trigger_audit_profiles ON profiles;
CREATE TRIGGER trigger_audit_profiles
AFTER INSERT ON profiles
FOR EACH ROW EXECUTE FUNCTION log_clinical_action();
