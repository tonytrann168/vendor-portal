import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default async function PortalTokenPage({ params }: { params: { token: string } }) {
  const admin = createAdminClient()

  const { data: invite } = await admin
    .from('vendor_invites')
    .select('*, vendors(name, email)')
    .eq('token', params.token)
    .is('accepted_at', null)
    .single()

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-sm w-full">
          <CardHeader>
            <CardTitle>Link Invalid or Expired</CardTitle>
            <CardDescription>
              This invite link has already been used or has expired. Contact your GC for a new link.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-sm w-full">
          <CardHeader>
            <CardTitle>Link Expired</CardTitle>
            <CardDescription>
              This invite link expired on {new Date(invite.expires_at).toLocaleDateString()}. Request a new one from your GC.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Check if vendor already has an account
  const { data: vendor } = await admin
    .from('vendors')
    .select('auth_user_id')
    .eq('id', invite.vendor_id)
    .single()

  if (vendor?.auth_user_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('vendor_invites')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invite.id)
    redirect('/portal')
  }

  // First time — send magic link
  const supabase = createClient()
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=vendor`

  const { error: otpError } = await supabase.auth.signInWithOtp({
    email: invite.email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
  })

  if (otpError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-sm w-full">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>
              We couldn&apos;t send a sign-in link to <strong>{invite.email}</strong>. Please contact your GC and ask them to resend the invite.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Mark invite as accepted only after the magic link was successfully sent
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from('vendor_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="max-w-sm w-full">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a magic link to <strong>{invite.email}</strong>. Click it to access your document portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The link expires in 1 hour. If you don&apos;t see it, check your spam folder.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
