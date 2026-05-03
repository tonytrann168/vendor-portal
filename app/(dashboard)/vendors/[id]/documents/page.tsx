import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { TopBar } from '@/components/layout/top-bar'
import { StatusBadge } from '@/components/shared/status-badge'
import { DocumentPreview } from '@/components/documents/document-preview'
import { ReviewActions } from '@/components/documents/review-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

export default async function VendorDocumentsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase.from('users').select('*').eq('id', user.id).single()

  const { data: vendor } = await supabase.from('vendors').select('*').eq('id', params.id).single()
  if (!vendor || vendor.company_id !== currentUser?.company_id) notFound()

  const { data: requirements } = await supabase
    .from('document_requirements')
    .select('*')
    .eq('company_id', vendor.company_id)

  const reqsWithDocs = await Promise.all(
    (requirements ?? []).map(async req => {
      const { data: docs } = await supabase
        .from('vendor_documents')
        .select('*')
        .eq('vendor_id', params.id)
        .eq('requirement_id', req.id)
        .order('uploaded_at', { ascending: false })
        .limit(1)

      let signedUrl: string | null = null
      if (docs?.[0]?.file_url) {
        const { data } = await supabase.storage.from('vendor-docs').createSignedUrl(
          docs[0].file_url, 3600
        )
        signedUrl = data?.signedUrl ?? null
      }

      return { ...req, doc: docs?.[0] ?? null, signedUrl }
    })
  )

  return (
    <>
      <TopBar title={`${vendor.name} — Documents`} />
      <div className="p-6 space-y-6">
        {reqsWithDocs.filter(r => r.doc?.status === 'pending').length === 0 && (
          <p className="text-sm text-muted-foreground">No documents pending review for this vendor.</p>
        )}
        {reqsWithDocs.map(req => {
          if (!req.doc) return null
          return (
            <Card key={req.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{req.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {req.doc.file_name} · Uploaded {format(new Date(req.doc.uploaded_at!), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <StatusBadge status={req.doc.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {req.signedUrl && (
                  <DocumentPreview fileUrl={req.signedUrl} fileName={req.doc.file_name} />
                )}
                {req.doc.status === 'pending' && (
                  <ReviewActions documentId={req.doc.id} vendorId={vendor.id} />
                )}
                {req.doc.rejection_reason && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Note:</span> {req.doc.rejection_reason}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}
