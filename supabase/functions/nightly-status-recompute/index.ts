import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const { error } = await supabase.rpc('recompute_all_vendor_statuses')

  if (error) {
    console.error('Vendor status recompute failed:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(
    JSON.stringify({ success: true, timestamp: new Date().toISOString() }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
})
