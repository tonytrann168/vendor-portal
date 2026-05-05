-- Remove pg_cron schedule if it exists (safe to run even if pg_cron not installed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('nightly-vendor-status-recompute');
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

-- RPC wrapper called by the nightly-status-recompute Edge Function
CREATE OR REPLACE FUNCTION recompute_all_vendor_statuses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE vendors
  SET status = compute_vendor_status(id),
      updated_at = now();
END;
$$;
