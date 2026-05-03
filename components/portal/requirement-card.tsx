import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { Upload, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import type { RequirementWithLatestDoc } from '@/lib/types'

const borderColor: Record<string, string> = {
  approved: 'border-l-green-500',
  rejected: 'border-l-red-500',
  pending: 'border-l-yellow-500',
  expired: 'border-l-red-500',
  missing: 'border-l-slate-500',
}

export function RequirementCard({
  requirement: req,
  vendorId,
}: {
  requirement: RequirementWithLatestDoc
  vendorId: string
}) {
  const doc = req.latest_document
  const statusKey = doc ? doc.status : 'missing'
  const isRevisionRequested = doc?.status === 'pending' && !!doc?.rejection_reason

  return (
    <div className={`border-l-4 ${borderColor[statusKey]} rounded-r-lg border border-l-0 p-4 space-y-2`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-medium text-sm">{req.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {req.description ?? ''}
            {req.requires_expiration ? ' · Expiration date required' : ''}
            {!req.is_required ? ' · Optional' : ''}
          </p>
        </div>
        <StatusBadge status={doc ? doc.status : 'incomplete' as any} />
      </div>

      {/* Rejection / revision reason — shown prominently, not hidden */}
      {doc?.rejection_reason && (
        <div className={`rounded p-2 text-xs ${isRevisionRequested ? 'bg-yellow-950/30 text-yellow-300' : 'bg-red-950/30 text-red-300'}`}>
          <strong>{isRevisionRequested ? 'Revision requested:' : 'Rejected:'}</strong> {doc.rejection_reason}
        </div>
      )}

      {doc?.expiration_date && doc.status === 'approved' && (
        <p className="text-xs text-muted-foreground">
          Expires: {format(new Date(doc.expiration_date), 'MMM d, yyyy')}
        </p>
      )}

      {/* Upload / re-upload CTA */}
      {(!doc || doc.status === 'rejected' || isRevisionRequested) && (
        <Link href={`/portal/${vendorId}/upload/${req.id}`} className={buttonVariants({ size: 'sm', className: 'w-full mt-1' })}>
          {doc ? (
            <><RefreshCw className="h-3 w-3 mr-1" />Re-upload</>
          ) : (
            <><Upload className="h-3 w-3 mr-1" />Upload</>
          )}
        </Link>
      )}
    </div>
  )
}
