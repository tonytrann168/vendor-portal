import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopBar } from '@/components/layout/top-bar'
import { SettingsNav } from '@/components/layout/settings-nav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { UserRole } from '@/lib/types'

const roleColors: Record<UserRole, string> = {
  admin: 'bg-indigo-800 text-indigo-300',
  compliance: 'bg-blue-800 text-blue-300',
  pm: 'bg-green-800 text-green-300',
  accounting: 'bg-yellow-800 text-yellow-300',
  field: 'bg-slate-700 text-slate-300',
}

export default async function TeamSettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase.from('users').select('*').eq('id', user.id).single()
  if (currentUser?.role !== 'admin') redirect('/dashboard')

  const { data: teamMembers } = await supabase
    .from('users')
    .select('*')
    .eq('company_id', currentUser!.company_id)
    .order('full_name')

  return (
    <>
      <TopBar title="Settings" />
      <div className="p-6">
        <SettingsNav />
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-base">Team</CardTitle>
            <p className="text-sm text-muted-foreground">
              To add a team member, create their Supabase Auth account and insert a row into the users table with their auth user ID.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(teamMembers ?? []).map(member => (
                <div key={member.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{member.full_name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <Badge className={`${roleColors[member.role as UserRole]} border-0 text-xs`}>
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
