import { TopBar } from '@/components/layout/top-bar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function VendorsLoading() {
  return (
    <>
      <TopBar title="Vendors" />
      <div className="p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-28" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
