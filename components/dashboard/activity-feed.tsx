import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ApprovalLog } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

const actionColors: Record<string, string> = {
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  uploaded: 'bg-indigo-500',
  revision_requested: 'bg-yellow-500',
  expired: 'bg-orange-500',
}

interface ActivityItem extends ApprovalLog {
  vendors: { name: string }
  vendor_documents: { file_name: string }
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground">No recent activity.</p>
        )}
        {items.map(item => (
          <div key={item.id} className="flex gap-3 items-start">
            <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${actionColors[item.action] ?? 'bg-slate-500'}`} />
            <div>
              <p className="text-xs font-medium leading-tight">
                {item.action.replace('_', ' ')} — {item.vendors?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.created_at!), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
