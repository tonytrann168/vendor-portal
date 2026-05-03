import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { RequirementCard } from '@/components/portal/requirement-card'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/shared/status-badge'
import type { RequirementWithLatestDoc } from '@/lib/types'

export default async function PortalChecklistPage({ params }: { params: { vendorId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', params.vendorId)
    .eq('auth_user_id', user.id)
    .single()

  if (!vendor) notFound()

  const { data: requirements } = await supabase
    .from('document_requirements')
    .select('*')
    .eq('company_id', vendor.company_id)
    .order('name')

  const reqsWithDocs: RequirementWithLatestDoc[] = await Promise.all(
    (requirements ?? []).map(async req => {
      const { data: docs } = await supabase
        .from('vendor_documents')
        .select('*')
        .eq('vendor_id', vendor.id)
        .eq('requirement_id', req.id)
        .order('uploaded_at', { ascending: false })
        .limit(1)
      return { ...req, latest_document: docs?.[0] ?? null }
    })
  )

  const total = reqsWithDocs.filter(r => r.is_required).length
  const submitted = reqsWithDocs.filter(r => r.is_required && r.latest_document).length
  const completionPct = total > 0 ? Math.round((submitted / total) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">Vendor Portal</p>
          <h1 className="text-2xl font-bold mt-1">{vendor.name}</h1>
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Completion</span>
            <StatusBadge status={vendor.status} />
          </div>
          <Progress value={completionPct} className="h-2" />
          <p className="text-xs text-muted-foreground">{submitted} of {total} documents submitted</p>
        </div>

        <div className="space-y-3">
          {reqsWithDocs.map(req => (
            <RequirementCard
              key={req.id}
              requirement={req}
              vendorId={vendor.id}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
