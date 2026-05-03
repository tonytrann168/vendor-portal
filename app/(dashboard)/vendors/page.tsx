import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopBar } from '@/components/layout/top-bar'
import { VendorTable } from '@/components/dashboard/vendor-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddVendorDialog } from '@/components/vendors/add-vendor-dialog'

export default async function VendorsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: vendors } = await supabase
    .from('vendors')
    .select('*')
    .order('name')

  return (
    <>
      <TopBar title="Vendors" />
      <div className="p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Vendors</CardTitle>
            {['admin', 'compliance', 'pm'].includes(currentUser?.role ?? '') && (
              <AddVendorDialog companyId={currentUser!.company_id} />
            )}
          </CardHeader>
          <CardContent>
            <VendorTable vendors={vendors ?? []} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
