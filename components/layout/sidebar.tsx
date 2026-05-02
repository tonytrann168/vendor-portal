'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, FolderKanban, ClipboardCheck, Settings, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vendors', label: 'Vendors', icon: Users },
  { href: '/review', label: 'Review Queue', icon: ClipboardCheck },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/settings/requirements', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-[#1e293b] flex flex-col z-50">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-white/10">
        <Building2 className="h-5 w-5 text-indigo-400" />
        <span className="font-bold text-white text-lg">VendorOS</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname.startsWith(href) && href !== '/dashboard'
                ? 'bg-indigo-600 text-white'
                : pathname === href
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
