import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopBar } from '@/components/layout/top-bar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createProject } from '@/lib/actions/projects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default async function ProjectsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase.from('users').select('*').eq('id', user.id).single()
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('company_id', currentUser!.company_id)
    .order('name')

  const statusColor: Record<string, string> = {
    active: 'bg-green-800 text-green-300',
    completed: 'bg-slate-700 text-slate-300',
    archived: 'bg-slate-800 text-slate-400',
  }

  return (
    <>
      <TopBar title="Projects" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(projects ?? []).map(p => (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <Card className="hover:border-indigo-500 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <Badge className={`${statusColor[p.status]} border-0 text-xs flex-shrink-0`}>{p.status}</Badge>
                  </div>
                  {p.address && <p className="text-xs text-muted-foreground">{p.address}</p>}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {['admin', 'pm'].includes(currentUser?.role ?? '') && (
          <Card className="max-w-md">
            <CardHeader><CardTitle className="text-base">New Project</CardTitle></CardHeader>
            <CardContent>
              <form action={createProject as unknown as (fd: FormData) => Promise<void>} className="space-y-3">
                <div className="space-y-1"><Label>Name *</Label><Input name="name" required /></div>
                <div className="space-y-1"><Label>Address</Label><Input name="address" /></div>
                <div className="space-y-1"><Label>Start Date</Label><Input name="start_date" type="date" /></div>
                <Button type="submit">Create Project</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
