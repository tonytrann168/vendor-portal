'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { OwnerRole } from '@/lib/types'

export async function createRequirement(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: currentUser } = await supabase
    .from('users').select('company_id, role').eq('id', user.id).single()
  if (!['admin', 'compliance'].includes(currentUser?.role ?? '')) return { error: 'Insufficient permissions' }

  const { data, error } = await supabase
    .from('document_requirements')
    .insert({
      company_id: currentUser!.company_id,
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      owner_role: formData.get('owner_role') as OwnerRole,
      is_required: formData.get('is_required') === 'true',
      requires_expiration: formData.get('requires_expiration') === 'true',
    })
    .select().single()

  if (error) return { error: error.message }
  revalidatePath('/settings/requirements')
  return { data }
}

export async function deleteRequirement(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: currentUser } = await supabase
    .from('users').select('company_id, role').eq('id', user.id).single()
  if (!['admin', 'compliance'].includes(currentUser?.role ?? '')) return { error: 'Insufficient permissions' }

  const { error } = await supabase
    .from('document_requirements').delete().eq('id', id).eq('company_id', currentUser!.company_id)

  if (error) return { error: error.message }
  revalidatePath('/settings/requirements')
  return {}
}
