'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useCallback } from 'react'

export function ReviewQueueFilters({ userRole }: { userRole: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || value === '') params.delete(key)
    else params.set(key, value)
    router.push(`${pathname}?${params.toString()}`)
  }, [pathname, router, searchParams])

  return (
    <div className="flex gap-3 flex-wrap">
      <Input
        placeholder="Search vendor name…"
        defaultValue={searchParams.get('vendor') ?? ''}
        onChange={e => updateFilter('vendor', e.target.value)}
        className="max-w-xs"
      />
      <Select
        defaultValue={searchParams.get('role') ?? userRole ?? ''}
        onValueChange={v => updateFilter('role', v ?? '')}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          <SelectItem value="compliance">Compliance</SelectItem>
          <SelectItem value="accounting">Accounting</SelectItem>
          <SelectItem value="pm">Project Manager</SelectItem>
          <SelectItem value="safety">Safety</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
