import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { UploadForm } from '@/components/portal/upload-form'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default async function PortalUploadPage({
  params,
}: {
  params: { vendorId: string; requirementId: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal')

  const { data: vendor } = await supabase
    .from('vendors').select('*').eq('id', params.vendorId).eq('auth_user_id', user.id).single()
  if (!vendor) notFound()

  const { data: requirement } = await supabase
    .from('document_requirements').select('*').eq('id', params.requirementId).single()
  if (!requirement) notFound()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <Link
          href={`/portal/${params.vendorId}/checklist`}
          className="flex items-center gap-1 text-sm text-indigo-400 hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />Back
        </Link>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Upload Document</p>
          <h1 className="text-xl font-bold mt-1">{requirement.name}</h1>
          {requirement.description && (
            <p className="text-sm text-muted-foreground mt-1">{requirement.description}</p>
          )}
        </div>

        <UploadForm
          vendorId={params.vendorId}
          requirementId={params.requirementId}
          requiresExpiration={requirement.requires_expiration}
        />
      </div>
    </div>
  )
}
