-- supabase/migrations/003_functions.sql
-- Vendor status computation function.
-- Priority order: blocked → incomplete → pending → expiring_soon → approved
-- Returns on first match. Only evaluates expiration_date on requirements
-- where requires_expiration = true.

CREATE OR REPLACE FUNCTION compute_vendor_status(p_vendor_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_company_id uuid;
  v_result boolean;
BEGIN
  SELECT company_id INTO v_company_id FROM vendors WHERE id = p_vendor_id;

  -- Priority 1: BLOCKED
  -- Any required doc is rejected, OR approved but expired (requires_expiration only)
  SELECT EXISTS (
    SELECT 1
    FROM document_requirements dr
    LEFT JOIN LATERAL (
      SELECT status, expiration_date
      FROM vendor_documents vd
      WHERE vd.vendor_id = p_vendor_id AND vd.requirement_id = dr.id
      ORDER BY vd.uploaded_at DESC
      LIMIT 1
    ) latest ON true
    WHERE dr.company_id = v_company_id
      AND dr.is_required = true
      AND (
        latest.status = 'rejected'
        OR (
          dr.requires_expiration = true
          AND latest.status = 'approved'
          AND latest.expiration_date IS NOT NULL
          AND latest.expiration_date < CURRENT_DATE
        )
      )
  ) INTO v_result;
  IF v_result THEN RETURN 'blocked'; END IF;

  -- Priority 2: INCOMPLETE
  -- Any required doc has no vendor_documents row at all
  SELECT EXISTS (
    SELECT 1
    FROM document_requirements dr
    WHERE dr.company_id = v_company_id
      AND dr.is_required = true
      AND NOT EXISTS (
        SELECT 1 FROM vendor_documents vd
        WHERE vd.vendor_id = p_vendor_id AND vd.requirement_id = dr.id
      )
  ) INTO v_result;
  IF v_result THEN RETURN 'incomplete'; END IF;

  -- Priority 3: PENDING
  -- Any required doc has status = 'pending'
  SELECT EXISTS (
    SELECT 1
    FROM document_requirements dr
    JOIN LATERAL (
      SELECT status
      FROM vendor_documents vd
      WHERE vd.vendor_id = p_vendor_id AND vd.requirement_id = dr.id
      ORDER BY vd.uploaded_at DESC
      LIMIT 1
    ) latest ON true
    WHERE dr.company_id = v_company_id
      AND dr.is_required = true
      AND latest.status = 'pending'
  ) INTO v_result;
  IF v_result THEN RETURN 'pending'; END IF;

  -- Priority 4: EXPIRING_SOON
  -- All approved; one or more expire within 30 days (requires_expiration only)
  SELECT EXISTS (
    SELECT 1
    FROM document_requirements dr
    JOIN LATERAL (
      SELECT expiration_date
      FROM vendor_documents vd
      WHERE vd.vendor_id = p_vendor_id AND vd.requirement_id = dr.id
      ORDER BY vd.uploaded_at DESC
      LIMIT 1
    ) latest ON true
    WHERE dr.company_id = v_company_id
      AND dr.is_required = true
      AND dr.requires_expiration = true
      AND latest.expiration_date IS NOT NULL
      AND latest.expiration_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days')
  ) INTO v_result;
  IF v_result THEN RETURN 'expiring_soon'; END IF;

  -- Priority 5: APPROVED
  RETURN 'approved';
END;
$$;

-- Trigger wrapper
CREATE OR REPLACE FUNCTION trigger_compute_vendor_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE vendors
  SET status = compute_vendor_status(NEW.vendor_id),
      updated_at = now()
  WHERE id = NEW.vendor_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS recompute_vendor_status ON vendor_documents;
CREATE TRIGGER recompute_vendor_status
  AFTER INSERT OR UPDATE ON vendor_documents
  FOR EACH ROW
  EXECUTE FUNCTION trigger_compute_vendor_status();

-- Nightly recompute is handled by the Edge Function supabase/functions/nightly-status-recompute
-- Scheduled via supabase/config.toml (no pg_cron extension required)
