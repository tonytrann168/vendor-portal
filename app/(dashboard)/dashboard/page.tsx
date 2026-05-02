import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatCards } from '@/components/dashboard/stat-cards'
import { VendorTable } from '@/components/dashboard/vendor-table'
import { TopBar } from '@/components/layout/top-bar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vendors } = await supabase
    .from('vendors')
    .select('*')
    .order('name')

  const safeVendors = vendors ?? []

  const stats = {
    total: safeVendors.length,
    approved: safeVendors.filter(v => v.status === 'approved').length,
    blocked: safeVendors.filter(v => v.status === 'blocked').length,
    expiringSoon: safeVendors.filter(v => v.status === 'expiring_soon').length,
  }

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="p-6 space-y-6">
        <StatCards {...stats} />
        <div className="flex gap-6">
          <div className="flex-1">
            <Card>
              <CardHeader><CardTitle className="text-base">Vendors</CardTitle></CardHeader>
              <CardContent><VendorTable vendors={safeVendors} /></CardContent>
            </Card>
          </div>
          {/* Right panel — activity + expiring docs added in Task 13 */}
          <div className="w-72 space-y-4" id="right-panel-placeholder" />
        </div>
      </div>
    </>
  )
}
