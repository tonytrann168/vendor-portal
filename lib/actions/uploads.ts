'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadVendorDocument(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const vendorId = formData.get('vendorId') as string
  const requirementId = formData.get('requirementId') as string
  const expirationDate = (formData.get('expirationDate') as string) || null
  const file = formData.get('file') as File

  if (!file || file.size === 0) return { error: 'Please select a file' }
  if (file.size > 10 * 1024 * 1024) return { error: 'File must be under 10MB' }

  // Verify vendor belongs to this user
  const { data: vendor } = await supabase
    .from('vendors').select('id, company_id').eq('id', vendorId).eq('auth_user_id', user.id).single()
  if (!vendor) return { error: 'Vendor not found' }

  const ext = file.name.split('.').pop()
  const path = `${vendor.company_id}/${vendorId}/${requirementId}/${Date.now()}.${ext}`
  const arrayBuffer = await file.arrayBuffer()

  const { error: storageError } = await supabase.storage
    .from('vendor-docs')
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false })

  if (storageError) return { error: storageError.message }

  // Always INSERT a new row — never update the rejected row
  const { data: doc, error: dbError } = await supabase
    .from('vendor_documents')
    .insert({
      vendor_id: vendorId,
      requirement_id: requirementId,
      file_url: path,
      file_name: file.name,
      expiration_date: expirationDate || null,
      status: 'pending',
    })
    .select()
    .single()

  if (dbError) return { error: dbError.message }

  await supabase.from('approval_log').insert({
    vendor_id: vendorId,
    document_id: doc.id,
    action: 'uploaded',
    performed_by: null,
    note: null,
  })

  // Postgres trigger auto-fires compute_vendor_status() on vendor_documents INSERT

  revalidatePath(`/portal/${vendorId}/checklist`)
  return { success: true }
}
