import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopBar } from '@/components/layout/top-bar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createRequirement, deleteRequirement } from '@/lib/actions/requirements'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'

export default async function RequirementsSettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase.from('users').select('*').eq('id', user.id).single()
  const isAdmin = ['admin', 'compliance'].includes(currentUser?.role ?? '')

  const { data: requirements } = await supabase
    .from('document_requirements')
    .select('*')
    .eq('company_id', currentUser!.company_id)
    .order('name')

  return (
    <>
      <TopBar title="Document Requirements" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Configured Requirements</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(requirements ?? []).map(req => (
                  <div key={req.id} className="flex items-start justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{req.name}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">{req.owner_role}</Badge>
                        {req.requires_expiration && <Badge variant="outline" className="text-xs">Expiration required</Badge>}
                        {!req.is_required && <Badge variant="outline" className="text-xs">Optional</Badge>}
                      </div>
                    </div>
                    {isAdmin && (
                      <form action={async () => { 'use server'; await deleteRequirement(req.id) }}>
                        <Button variant="ghost" size="icon" type="submit" className="h-7 w-7">
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader><CardTitle className="text-base">Add Requirement</CardTitle></CardHeader>
              <CardContent>
                <form action={createRequirement as unknown as (fd: FormData) => Promise<void>} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" name="description" />
                  </div>
                  <div className="space-y-2">
                    <Label>Owner Role *</Label>
                    <select name="owner_role" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="compliance">Compliance</option>
                      <option value="accounting">Accounting</option>
                      <option value="pm">Project Manager</option>
                      <option value="safety">Safety</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="is_required" value="true" defaultChecked />
                      Required
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="requires_expiration" value="true" />
                      Requires Expiration
                    </label>
                  </div>
                  <Button type="submit">Add Requirement</Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
