'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createVendor(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: currentUser } = await supabase
    .from('users').select('company_id, role').eq('id', user.id).single()
  if (!currentUser) return { error: 'User not found' }
  if (!['admin', 'compliance', 'pm'].includes(currentUser.role)) return { error: 'Insufficient permissions' }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string | null
  const trade_type = formData.get('trade_type') as string | null

  if (!name || !email) return { error: 'Name and email are required' }

  const { data, error } = await supabase
    .from('vendors')
    .insert({ company_id: currentUser.company_id, name, email, phone, trade_type })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/vendors')
  revalidatePath('/dashboard')
  return { data }
}
