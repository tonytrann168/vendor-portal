'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ReviewAction = 'approved' | 'rejected' | 'revision_requested'

export async function reviewDocument({
  documentId,
  vendorId,
  action,
  reason,
}: {
  documentId: string
  vendorId: string
  action: ReviewAction
  reason?: string
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: currentUser } = await supabase
    .from('users').select('company_id, role').eq('id', user.id).single()
  if (!['admin', 'compliance', 'pm', 'accounting'].includes(currentUser?.role ?? '')) {
    return { error: 'Insufficient permissions' }
  }

  if ((action === 'rejected' || action === 'revision_requested') && !reason?.trim()) {
    return { error: 'A reason is required for this action' }
  }

  // revision_requested keeps status as 'pending' so vendor can re-upload
  const docStatus = action === 'revision_requested' ? 'pending' : action

  const { error: docError } = await supabase
    .from('vendor_documents')
    .update({
      status: docStatus,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: action !== 'approved' ? (reason ?? null) : null,
    })
    .eq('id', documentId)

  if (docError) return { error: docError.message }

  await supabase.from('approval_log').insert({
    vendor_id: vendorId,
    document_id: documentId,
    action,
    performed_by: user.id,
    note: reason ?? null,
  })

  revalidatePath(`/vendors/${vendorId}/documents`)
  revalidatePath(`/vendors/${vendorId}`)
  revalidatePath('/review')
  return {}
}
