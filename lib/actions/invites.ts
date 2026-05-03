'use server'
import { createClient } from '@/lib/supabase/server'
import { sendVendorInvite } from '@/lib/email'
import { revalidatePath } from 'next/cache'

export async function generateAndSendInvite(vendorId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: currentUser } = await supabase
    .from('users').select('company_id, role').eq('id', user.id).single()
  if (!currentUser) return { error: 'User not found' }
  if (!['admin', 'compliance', 'pm'].includes(currentUser.role)) return { error: 'Insufficient permissions' }

  const { data: vendor } = await supabase
    .from('vendors').select('id, name, email').eq('id', vendorId).single()
  if (!vendor) return { error: 'Vendor not found' }

  const { data: company } = await supabase
    .from('companies').select('name').eq('id', currentUser.company_id).single()

  // Expire any existing pending invites for this vendor
  await supabase
    .from('vendor_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('vendor_id', vendorId)
    .is('accepted_at', null)

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: invite, error: inviteError } = await supabase
    .from('vendor_invites')
    .insert({ vendor_id: vendorId, email: vendor.email, expires_at: expiresAt })
    .select()
    .single()

  if (inviteError) return { error: inviteError.message }

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/invite/${invite.token}`

  const { error: emailError } = await sendVendorInvite({
    to: vendor.email,
    vendorName: vendor.name,
    companyName: company?.name ?? 'Your GC',
    inviteUrl,
  })

  if (emailError) return { error: 'Invite created but email failed to send. URL: ' + inviteUrl }

  revalidatePath(`/vendors/${vendorId}`)
  return { inviteUrl }
}
