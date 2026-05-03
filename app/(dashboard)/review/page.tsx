import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopBar } from '@/components/layout/top-bar'
import { StatusBadge } from '@/components/shared/status-badge'
import { ReviewActions } from '@/components/documents/review-actions'
import { ReviewQueueFilters } from '@/components/documents/review-queue-filters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams: { role?: string; vendor?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase.from('users').select('*').eq('id', user.id).single()
  if (!currentUser) redirect('/login')

  const canSeeAll = ['admin', 'compliance'].includes(currentUser.role)
  const roleFilter = searchParams.role ?? (canSeeAll ? undefined : currentUser.role)

  let query = supabase
    .from('vendor_documents')
    .select(`
      *,
      vendors!inner(id, name, email, company_id),
      document_requirements!inner(id, name, owner_role, requires_expiration)
    `)
    .eq('status', 'pending')
    .eq('vendors.company_id', currentUser.company_id)
    .order('uploaded_at', { ascending: true })

  if (roleFilter && roleFilter !== 'all') {
    query = query.eq('document_requirements.owner_role', roleFilter)
  }

  if (searchParams.vendor) {
    query = query.ilike('vendors.name', `%${searchParams.vendor}%`)
  }

  const { data: pendingDocs } = await query

  // Deduplicate: keep only the latest pending doc per (vendor_id, requirement_id)
  const seen = new Set<string>()
  const deduped = (pendingDocs ?? []).filter(doc => {
    const key = `${doc.vendor_id}:${doc.requirement_id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return (
    <>
      <TopBar title="Review Queue" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {deduped.length} document{deduped.length !== 1 ? 's' : ''} pending review
          </p>
          <Suspense>
            <ReviewQueueFilters userRole={currentUser.role} />
          </Suspense>
        </div>

        {deduped.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="font-medium">Queue is clear</p>
            <p className="text-sm mt-1">No documents pending review for your role.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deduped.map(doc => {
              const vendor = (doc as any).vendors
              const req = (doc as any).document_requirements
              return (
                <Card key={doc.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm">
                          <Link href={`/vendors/${vendor.id}`} className="hover:underline">
                            {vendor.name}
                          </Link>
                          {' — '}{req.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {doc.file_name} · Uploaded {format(new Date(doc.uploaded_at), 'MMM d, yyyy h:mm a')} · Owner: {req.owner_role}
                        </p>
                      </div>
                      <StatusBadge status={doc.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ReviewActions documentId={doc.id} vendorId={vendor.id} />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
