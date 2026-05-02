'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/shared/status-badge'
import type { Vendor, VendorStatus } from '@/lib/types'

export function VendorTable({ vendors }: { vendors: Vendor[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<VendorStatus | 'all'>('all')

  const filtered = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      (v.trade_type ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input
          placeholder="Search vendors..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as VendorStatus | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
            <SelectItem value="incomplete">Incomplete</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No vendors match your filters.</p>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Vendor</th>
                <th className="text-left px-4 py-3 font-medium">Trade</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(vendor => (
                <tr key={vendor.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/vendors/${vendor.id}`} className="font-medium hover:underline">
                      {vendor.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{vendor.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{vendor.trade_type ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={vendor.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
