import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { TopBar } from '@/components/layout/top-bar'
import { StatusBadge } from '@/components/shared/status-badge'
import { InviteButton } from '@/components/vendors/invite-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import type { RequirementWithLatestDoc } from '@/lib/types'

export default async function VendorProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: vendor }, { data: currentUser }] = await Promise.all([
    supabase.from('vendors').select('*').eq('id', params.id).single(),
    supabase.from('users').select('*').eq('id', user.id).single(),
  ])

  if (!vendor || vendor.company_id !== currentUser?.company_id) notFound()

  const { data: requirements } = await supabase
    .from('document_requirements')
    .select('*')
    .eq('company_id', vendor.company_id)

  const requirementsWithDocs: RequirementWithLatestDoc[] = await Promise.all(
    (requirements ?? []).map(async req => {
      const { data: docs } = await supabase
        .from('vendor_documents')
        .select('*')
        .eq('vendor_id', params.id)
        .eq('requirement_id', req.id)
        .order('uploaded_at', { ascending: false })
        .limit(1)
      return { ...req, latest_document: docs?.[0] ?? null }
    })
  )

  const { data: auditLog } = await supabase
    .from('approval_log')
    .select('*, users(full_name), vendor_documents(file_name, requirement_id, document_requirements(name))')
    .eq('vendor_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <TopBar title={vendor.name} />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{vendor.name}</h2>
            <p className="text-muted-foreground">{vendor.email} · {vendor.trade_type ?? 'No trade type'}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={vendor.status} />
            <InviteButton vendorId={vendor.id} />
            <Link href={`/vendors/${vendor.id}/documents`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              <FileText className="h-4 w-4 mr-1" />Review Docs
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Document Checklist</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {requirementsWithDocs.map(req => (
                <div key={req.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{req.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {req.owner_role} · {req.requires_expiration ? 'Expiration required' : 'No expiration'}
                      {!req.is_required && ' · Optional'}
                    </p>
                    {req.latest_document?.rejection_reason && (
                      <p className="text-xs text-red-400 mt-0.5">
                        Reason: {req.latest_document.rejection_reason}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {req.latest_document ? (
                      <StatusBadge status={req.latest_document.status} />
                    ) : (
                      <Badge variant="outline" className="text-xs">Not uploaded</Badge>
                    )}
                    {req.latest_document?.expiration_date && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Exp: {format(new Date(req.latest_document.expiration_date), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Audit Trail</CardTitle></CardHeader>
          <CardContent>
            {(!auditLog || auditLog.length === 0) ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <div className="space-y-3">
                {auditLog.map(entry => (
                  <div key={entry.id} className="flex gap-3 text-sm">
                    <div className="w-32 text-xs text-muted-foreground flex-shrink-0 pt-0.5">
                      {formatDistanceToNow(new Date(entry.created_at!), { addSuffix: true })}
                    </div>
                    <div>
                      <span className="font-medium capitalize">{entry.action.replace('_', ' ')}</span>
                      {(entry as any).vendor_documents?.document_requirements?.name && (
                        <span className="text-muted-foreground"> — {(entry as any).vendor_documents.document_requirements.name}</span>
                      )}
                      {(entry as any).users?.full_name && (
                        <span className="text-muted-foreground"> by {(entry as any).users.full_name}</span>
                      )}
                      {entry.note && <p className="text-xs text-muted-foreground mt-0.5">"{entry.note}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
