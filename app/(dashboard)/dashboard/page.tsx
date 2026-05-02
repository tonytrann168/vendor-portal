import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatCards } from '@/components/dashboard/stat-cards'
import { VendorTable } from '@/components/dashboard/vendor-table'
import { TopBar } from '@/components/layout/top-bar'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { ExpiringDocsPanel } from '@/components/dashboard/expiring-docs-panel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Vendor } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vendors } = await supabase
    .from('vendors')
    .select('*')
    .order('name')

  const { data: recentActivity } = await supabase
    .from('approval_log')
    .select('*, vendors(name), vendor_documents(file_name)')
    .order('created_at', { ascending: false })
    .limit(10)

  const today = new Date().toISOString().split('T')[0]
  const in90 = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data: expiringDocs } = await supabase
    .from('vendor_documents')
    .select('*, vendors(id, name), document_requirements(name)')
    .eq('status', 'approved')
    .not('expiration_date', 'is', null)
    .gte('expiration_date', today)
    .lte('expiration_date', in90)

  const safeVendors: Vendor[] = vendors ?? []

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
          <div className="w-72 space-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ActivityFeed items={(recentActivity ?? []) as any} />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ExpiringDocsPanel docs={(expiringDocs ?? []) as any} />
          </div>
        </div>
      </div>
    </>
  )
}
