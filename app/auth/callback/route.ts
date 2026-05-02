import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'vendor' | null
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  if (type === 'vendor') {
    // Link auth_user_id to vendor record on first login
    const admin = createAdminClient()
    const { data: vendorRow } = await admin
      .from('vendors')
      .select('id, auth_user_id')
      .eq('email', user.email!)
      .is('auth_user_id', null)
      .single() as { data: { id: string; auth_user_id: string | null } | null; error: unknown }

    if (vendorRow) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (admin as any)
        .from('vendors')
        .update({ auth_user_id: user.id })
        .eq('id', vendorRow.id)

      if (updateError) {
        return NextResponse.redirect(`${origin}/login?error=link_failed`)
      }
    }

    return NextResponse.redirect(`${origin}/portal`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
