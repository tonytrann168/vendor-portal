import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { TopBar } from '@/components/layout/top-bar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { assignVendorToProject, removeVendorFromProject } from '@/lib/actions/projects'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { X } from 'lucide-react'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase.from('users').select('*').eq('id', user.id).single()
  const { data: project } = await supabase.from('projects').select('*').eq('id', params.id).single()
  if (!project || project.company_id !== currentUser?.company_id) notFound()

  const { data: projectVendors } = await supabase
    .from('project_vendors')
    .select('*, vendors(*)')
    .eq('project_id', params.id)

  const { data: allVendors } = await supabase
    .from('vendors')
    .select('id, name, status')
    .eq('company_id', currentUser!.company_id)
    .order('name')

  const assignedIds = new Set((projectVendors ?? []).map(pv => pv.vendor_id))
  const unassigned = (allVendors ?? []).filter(v => !assignedIds.has(v.id))
  const canEdit = ['admin', 'pm'].includes(currentUser?.role ?? '')

  return (
    <>
      <TopBar title={project.name} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Assigned Vendors</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(projectVendors ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No vendors assigned yet.</p>
              )}
              {(projectVendors ?? []).map(pv => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const v = (pv as any).vendors
                return (
                  <div key={pv.id} className="flex items-center justify-between">
                    <div>
                      <Link href={`/vendors/${v.id}`} className="text-sm font-medium hover:underline">{v.name}</Link>
                      <p className="text-xs text-muted-foreground">{v.trade_type ?? ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={v.status} />
                      {canEdit && (
                        <form action={async () => { 'use server'; await removeVendorFromProject(params.id, v.id) }}>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <X className="h-3 w-3" />
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {canEdit && unassigned.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Add Vendor</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {unassigned.map(v => (
                  <div key={v.id} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm">{v.name}</span>
                      <StatusBadge status={v.status} />
                    </div>
                    <form action={async () => { 'use server'; await assignVendorToProject(params.id, v.id) }}>
                      <Button size="sm" variant="outline" type="submit">Assign</Button>
                    </form>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
