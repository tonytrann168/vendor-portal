-- supabase/seed.sql
-- Run AFTER creating 3 auth users in Supabase dashboard:
--   admin@apexconstruction.com (password: Admin1234!)
--   compliance@apexconstruction.com (password: Admin1234!)
--   pm@apexconstruction.com (password: Admin1234!)
-- Replace the auth user UUIDs below with the actual IDs from auth.users

DO $$
DECLARE
  v_company_id uuid := gen_random_uuid();
  v_admin_id uuid;
  v_compliance_id uuid;
  v_pm_id uuid;

  v_vendor_abc uuid := gen_random_uuid();
  v_vendor_summit uuid := gen_random_uuid();
  v_vendor_mesa uuid := gen_random_uuid();
  v_vendor_ridge uuid := gen_random_uuid();
  v_vendor_coast uuid := gen_random_uuid();

  v_req_coi_gl uuid := gen_random_uuid();
  v_req_coi_wc uuid := gen_random_uuid();
  v_req_w9 uuid := gen_random_uuid();
  v_req_subcontract uuid := gen_random_uuid();
  v_req_license uuid := gen_random_uuid();
  v_req_ach uuid := gen_random_uuid();
  v_req_safety uuid := gen_random_uuid();

  v_project_id uuid := gen_random_uuid();
  v_doc_id uuid;
BEGIN

  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@apexconstruction.com';
  SELECT id INTO v_compliance_id FROM auth.users WHERE email = 'compliance@apexconstruction.com';
  SELECT id INTO v_pm_id FROM auth.users WHERE email = 'pm@apexconstruction.com';

  INSERT INTO companies (id, name, slug) VALUES (v_company_id, 'Apex Construction', 'apex-construction');

  INSERT INTO users (id, company_id, email, full_name, role) VALUES
    (v_admin_id, v_company_id, 'admin@apexconstruction.com', 'Alex Admin', 'admin'),
    (v_compliance_id, v_company_id, 'compliance@apexconstruction.com', 'Casey Compliance', 'compliance'),
    (v_pm_id, v_company_id, 'pm@apexconstruction.com', 'Pat PM', 'pm');

  INSERT INTO document_requirements (id, company_id, name, description, owner_role, is_required, requires_expiration) VALUES
    (v_req_coi_gl, v_company_id, 'COI — General Liability', 'Certificate of Insurance for general liability coverage', 'compliance', true, true),
    (v_req_coi_wc, v_company_id, 'COI — Workers Comp', 'Certificate of Insurance for workers compensation', 'compliance', true, true),
    (v_req_w9, v_company_id, 'W-9', 'IRS W-9 taxpayer identification form', 'accounting', true, false),
    (v_req_subcontract, v_company_id, 'Signed Subcontract', 'Fully executed subcontract agreement', 'pm', true, false),
    (v_req_license, v_company_id, 'Trade License', 'State-issued contractor trade license', 'compliance', true, true),
    (v_req_ach, v_company_id, 'ACH / Direct Deposit Form', 'Banking information for payment processing', 'accounting', true, false),
    (v_req_safety, v_company_id, 'Safety Program', 'Written safety program documentation', 'safety', true, false);

  INSERT INTO vendors (id, company_id, name, email, phone, trade_type) VALUES
    (v_vendor_abc, v_company_id, 'ABC Electrical', 'abc@electrical.com', '555-0101', 'Electrical'),
    (v_vendor_summit, v_company_id, 'Summit Plumbing', 'info@summitplumbing.com', '555-0102', 'Plumbing'),
    (v_vendor_mesa, v_company_id, 'Mesa Concrete', 'mesa@concrete.com', '555-0103', 'Concrete'),
    (v_vendor_ridge, v_company_id, 'Ridge Framing LLC', 'ridge@framing.com', '555-0104', 'Framing'),
    (v_vendor_coast, v_company_id, 'Coast HVAC', 'coast@hvac.com', '555-0105', 'HVAC');

  -- ABC Electrical: APPROVED (all 7 docs approved, none expiring soon)
  INSERT INTO vendor_documents (vendor_id, requirement_id, file_url, file_name, status, expiration_date, reviewed_by, reviewed_at, uploaded_at) VALUES
    (v_vendor_abc, v_req_coi_gl, 'seed/abc/coi_gl.pdf', 'coi_gl.pdf', 'approved', CURRENT_DATE + INTERVAL '200 days', v_compliance_id, now() - INTERVAL '2 days', now() - INTERVAL '3 days'),
    (v_vendor_abc, v_req_coi_wc, 'seed/abc/coi_wc.pdf', 'coi_wc.pdf', 'approved', CURRENT_DATE + INTERVAL '180 days', v_compliance_id, now() - INTERVAL '2 days', now() - INTERVAL '3 days'),
    (v_vendor_abc, v_req_w9, 'seed/abc/w9.pdf', 'w9.pdf', 'approved', NULL, v_compliance_id, now() - INTERVAL '2 days', now() - INTERVAL '3 days'),
    (v_vendor_abc, v_req_subcontract, 'seed/abc/subcontract.pdf', 'subcontract.pdf', 'approved', NULL, v_pm_id, now() - INTERVAL '2 days', now() - INTERVAL '3 days'),
    (v_vendor_abc, v_req_license, 'seed/abc/license.pdf', 'license.pdf', 'approved', CURRENT_DATE + INTERVAL '220 days', v_compliance_id, now() - INTERVAL '2 days', now() - INTERVAL '3 days'),
    (v_vendor_abc, v_req_ach, 'seed/abc/ach.pdf', 'ach.pdf', 'approved', NULL, v_compliance_id, now() - INTERVAL '2 days', now() - INTERVAL '3 days'),
    (v_vendor_abc, v_req_safety, 'seed/abc/safety.pdf', 'safety.pdf', 'approved', NULL, v_compliance_id, now() - INTERVAL '2 days', now() - INTERVAL '3 days');

  -- Summit Plumbing: BLOCKED (W9 rejected)
  INSERT INTO vendor_documents (vendor_id, requirement_id, file_url, file_name, status, rejection_reason, reviewed_by, reviewed_at, uploaded_at) VALUES
    (v_vendor_summit, v_req_coi_gl, 'seed/summit/coi_gl.pdf', 'coi_gl.pdf', 'approved', NULL, v_compliance_id, now() - INTERVAL '1 day', now() - INTERVAL '2 days'),
    (v_vendor_summit, v_req_w9, 'seed/summit/w9.pdf', 'w9_wrong_year.pdf', 'rejected', 'Wrong tax year — please resubmit with current year W-9', v_compliance_id, now() - INTERVAL '1 day', now() - INTERVAL '2 days');

  -- Mesa Concrete: PENDING (docs uploaded, awaiting review)
  INSERT INTO vendor_documents (vendor_id, requirement_id, file_url, file_name, status, expiration_date, uploaded_at) VALUES
    (v_vendor_mesa, v_req_coi_gl, 'seed/mesa/coi_gl.pdf', 'coi_gl.pdf', 'pending', CURRENT_DATE + INTERVAL '90 days', now() - INTERVAL '1 hour'),
    (v_vendor_mesa, v_req_coi_wc, 'seed/mesa/coi_wc.pdf', 'coi_wc.pdf', 'pending', CURRENT_DATE + INTERVAL '90 days', now() - INTERVAL '1 hour'),
    (v_vendor_mesa, v_req_w9, 'seed/mesa/w9.pdf', 'w9.pdf', 'pending', NULL, now() - INTERVAL '1 hour');

  -- Ridge Framing: EXPIRING_SOON (all approved but COI GL expires in 12 days)
  INSERT INTO vendor_documents (vendor_id, requirement_id, file_url, file_name, status, expiration_date, reviewed_by, reviewed_at, uploaded_at) VALUES
    (v_vendor_ridge, v_req_coi_gl, 'seed/ridge/coi_gl.pdf', 'coi_gl.pdf', 'approved', CURRENT_DATE + INTERVAL '12 days', v_compliance_id, now() - INTERVAL '30 days', now() - INTERVAL '31 days'),
    (v_vendor_ridge, v_req_coi_wc, 'seed/ridge/coi_wc.pdf', 'coi_wc.pdf', 'approved', CURRENT_DATE + INTERVAL '150 days', v_compliance_id, now() - INTERVAL '30 days', now() - INTERVAL '31 days'),
    (v_vendor_ridge, v_req_w9, 'seed/ridge/w9.pdf', 'w9.pdf', 'approved', NULL, v_compliance_id, now() - INTERVAL '30 days', now() - INTERVAL '31 days'),
    (v_vendor_ridge, v_req_subcontract, 'seed/ridge/subcontract.pdf', 'subcontract.pdf', 'approved', NULL, v_pm_id, now() - INTERVAL '30 days', now() - INTERVAL '31 days'),
    (v_vendor_ridge, v_req_license, 'seed/ridge/license.pdf', 'license.pdf', 'approved', CURRENT_DATE + INTERVAL '200 days', v_compliance_id, now() - INTERVAL '30 days', now() - INTERVAL '31 days'),
    (v_vendor_ridge, v_req_ach, 'seed/ridge/ach.pdf', 'ach.pdf', 'approved', NULL, v_compliance_id, now() - INTERVAL '30 days', now() - INTERVAL '31 days'),
    (v_vendor_ridge, v_req_safety, 'seed/ridge/safety.pdf', 'safety.pdf', 'approved', NULL, v_compliance_id, now() - INTERVAL '30 days', now() - INTERVAL '31 days');

  -- Coast HVAC: INCOMPLETE (no documents at all)

  -- Recompute all vendor statuses
  UPDATE vendors SET status = compute_vendor_status(id), updated_at = now()
    WHERE company_id = v_company_id;

  -- Sample project
  INSERT INTO projects (id, company_id, name, address, start_date, status) VALUES
    (v_project_id, v_company_id, 'Northgate Tower', '1200 Northgate Ave', CURRENT_DATE - INTERVAL '60 days', 'active');

  INSERT INTO project_vendors (project_id, vendor_id) VALUES
    (v_project_id, v_vendor_abc),
    (v_project_id, v_vendor_summit),
    (v_project_id, v_vendor_mesa);

  -- Sample approval log entries
  INSERT INTO approval_log (vendor_id, document_id, action, performed_by, note, created_at)
  SELECT v_vendor_abc, id, 'approved', v_compliance_id, NULL, now() - INTERVAL '2 days'
  FROM vendor_documents WHERE vendor_id = v_vendor_abc LIMIT 3;

  INSERT INTO approval_log (vendor_id, document_id, action, performed_by, note, created_at)
  SELECT v_vendor_summit, id, 'rejected', v_compliance_id, 'Wrong tax year — please resubmit with current year W-9', now() - INTERVAL '1 day'
  FROM vendor_documents WHERE vendor_id = v_vendor_summit AND status = 'rejected';

  INSERT INTO approval_log (vendor_id, document_id, action, performed_by, note, created_at)
  SELECT v_vendor_mesa, id, 'uploaded', NULL, NULL, now() - INTERVAL '1 hour'
  FROM vendor_documents WHERE vendor_id = v_vendor_mesa LIMIT 1;

END $$;

-- Verify:
-- SELECT name, status FROM vendors ORDER BY name;
-- Expected: ABC Electrical=approved, Coast HVAC=incomplete, Mesa Concrete=pending,
--           Ridge Framing LLC=expiring_soon, Summit Plumbing=blocked
