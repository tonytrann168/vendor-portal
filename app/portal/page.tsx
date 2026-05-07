import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function PortalLandingPage({
  searchParams,
}: {
  searchParams: { sent?: string; error?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (vendor) redirect(`/portal/${vendor.id}/checklist`)
  }

  async function sendMagicLink(formData: FormData) {
    'use server'
    const email = formData.get('email') as string
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=vendor`,
        shouldCreateUser: false,
      },
    })
    if (error) redirect(`/portal?error=1`)
    redirect(`/portal?sent=1`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="max-w-sm w-full">
        <CardHeader>
          <CardTitle>Vendor Portal</CardTitle>
          <CardDescription>
            {searchParams.sent
              ? 'Check your email for a sign-in link.'
              : searchParams.error
              ? 'Something went wrong sending your sign-in link. Please try again.'
              : 'Enter your email to receive a sign-in link.'}
          </CardDescription>
        </CardHeader>
        {(!searchParams.sent || searchParams.error) && (
          <CardContent>
            <form action={sendMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" name="email" type="email" required placeholder="you@company.com" />
              </div>
              <Button type="submit" className="w-full">Send sign-in link</Button>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
