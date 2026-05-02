import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { VendorStatus, DocumentStatus } from '@/lib/types'

type AnyStatus = VendorStatus | DocumentStatus

const statusConfig: Record<AnyStatus, { label: string; className: string }> = {
  approved:      { label: 'Approved',      className: 'bg-green-800 text-green-300 dark:bg-green-900 dark:text-green-300 border-0' },
  blocked:       { label: 'Blocked',       className: 'bg-red-800 text-red-300 dark:bg-red-900 dark:text-red-300 border-0' },
  pending:       { label: 'Pending',       className: 'bg-yellow-800 text-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 border-0' },
  expiring_soon: { label: 'Expiring Soon', className: 'bg-orange-800 text-orange-200 dark:bg-orange-900 dark:text-orange-200 border-0' },
  incomplete:    { label: 'Incomplete',    className: 'bg-slate-700 text-slate-300 border-0' },
  rejected:      { label: 'Rejected',      className: 'bg-red-800 text-red-300 border-0' },
  expired:       { label: 'Expired',       className: 'bg-red-800 text-red-300 border-0' },
}

export function StatusBadge({ status }: { status: AnyStatus }) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-slate-700 text-slate-300 border-0' }
  return (
    <Badge className={cn('text-xs font-medium', config.className)}>
      {config.label}
    </Badge>
  )
}
