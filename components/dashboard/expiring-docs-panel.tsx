'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { VendorDocument } from '@/lib/types'
import { differenceInDays } from 'date-fns'

interface ExpiringDoc extends VendorDocument {
  vendors: { id: string; name: string }
  document_requirements: { name: string }
}

export function ExpiringDocsPanel({ docs }: { docs: ExpiringDoc[] }) {
  const [window, setWindow] = useState<30 | 60 | 90>(30)

  const filtered = docs.filter(d => {
    if (!d.expiration_date) return false
    const days = differenceInDays(new Date(d.expiration_date), new Date())
    return days >= 0 && days <= window
  })

  const urgencyClass = (d: ExpiringDoc) => {
    const days = differenceInDays(new Date(d.expiration_date!), new Date())
    if (days <= 14) return 'border-l-red-500 bg-red-950/30'
    return 'border-l-yellow-500 bg-yellow-950/20'
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Expiring Docs</CardTitle>
        <div className="flex gap-1 mt-1">
          {([30, 60, 90] as const).map(d => (
            <Button
              key={d}
              size="sm"
              variant={window === d ? 'default' : 'outline'}
              className="h-6 text-xs px-2"
              onClick={() => setWindow(d)}
            >
              {d}d
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground">No documents expiring in {window} days.</p>
        )}
        {filtered.map(doc => (
          <div key={doc.id} className={`border-l-2 pl-3 py-1 rounded-sm ${urgencyClass(doc)}`}>
            <Link href={`/vendors/${doc.vendors.id}`} className="text-xs font-medium hover:underline block">
              {doc.vendors.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {doc.document_requirements.name} · {differenceInDays(new Date(doc.expiration_date!), new Date())}d
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
