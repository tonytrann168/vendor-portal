'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/settings/requirements', label: 'Document Requirements' },
  { href: '/settings/team', label: 'Team' },
]

export function SettingsNav() {
  const pathname = usePathname()
  return (
    <nav className="flex gap-1 border-b mb-6">
      {tabs.map(tab => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            pathname === tab.href
              ? 'border-indigo-500 text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
