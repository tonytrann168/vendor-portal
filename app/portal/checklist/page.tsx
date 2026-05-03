import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PortalChecklistRedirectPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal')

  const { data: vendor } = await supabase
    .from('vendors').select('id').eq('auth_user_id', user.id).single()

  if (!vendor) redirect('/portal')
  redirect(`/portal/${vendor.id}/checklist`)
}
