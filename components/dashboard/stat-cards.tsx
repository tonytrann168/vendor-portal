import { Card, CardContent } from '@/components/ui/card'
import { Users, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface StatCardsProps {
  total: number
  approved: number
  blocked: number
  expiringSoon: number
}

export function StatCards({ total, approved, blocked, expiringSoon }: StatCardsProps) {
  const stats = [
    { label: 'Total Vendors', value: total, icon: Users, color: 'text-foreground' },
    { label: 'Approved', value: approved, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Blocked', value: blocked, icon: XCircle, color: 'text-red-500' },
    { label: 'Expiring Soon', value: expiringSoon, icon: AlertTriangle, color: 'text-orange-500' },
  ]
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <Card key={label}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
              </div>
              <Icon className={`h-8 w-8 ${color} opacity-60`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
