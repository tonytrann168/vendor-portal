'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: currentUser } = await supabase
    .from('users').select('company_id, role').eq('id', user.id).single()
  if (!['admin', 'pm'].includes(currentUser?.role ?? '')) return { error: 'Insufficient permissions' }

  const { data, error } = await supabase.from('projects').insert({
    company_id: currentUser!.company_id,
    name: formData.get('name') as string,
    address: (formData.get('address') as string) || null,
    start_date: (formData.get('start_date') as string) || null,
  }).select().single()

  if (error) return { error: error.message }
  revalidatePath('/projects')
  return { data }
}

export async function assignVendorToProject(projectId: string, vendorId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('project_vendors').insert({ project_id: projectId, vendor_id: vendorId })
  if (error) return { error: error.message }
  revalidatePath(`/projects/${projectId}`)
  return {}
}

export async function removeVendorFromProject(projectId: string, vendorId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('project_vendors')
    .delete().eq('project_id', projectId).eq('vendor_id', vendorId)
  if (error) return { error: error.message }
  revalidatePath(`/projects/${projectId}`)
  return {}
}
