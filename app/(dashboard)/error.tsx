'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <div>
        <p className="font-semibold">Something went wrong</p>
        <p className="text-sm text-muted-foreground mt-1">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
      </div>
      <Button variant="outline" onClick={reset}>Try again</Button>
    </div>
  )
}
