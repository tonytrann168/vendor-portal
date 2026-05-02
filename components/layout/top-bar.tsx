import { createClient } from '@/lib/supabase/server'
import { ThemeToggle } from './theme-toggle'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export async function TopBar({ title }: { title?: string }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="fixed top-0 left-56 right-0 h-16 border-b bg-background/95 backdrop-blur flex items-center justify-between px-6 z-40">
      <h1 className="font-semibold text-lg">{title}</h1>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{user?.email}</span>
        <ThemeToggle />
        <form action="/auth/signout" method="post">
          <Button variant="ghost" size="icon" type="submit" className="text-slate-600 dark:text-slate-400">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  )
}
