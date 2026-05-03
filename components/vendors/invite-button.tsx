'use client'
import { useState } from 'react'
import { generateAndSendInvite } from '@/lib/actions/invites'
import { Button } from '@/components/ui/button'
import { Mail, Check, Copy } from 'lucide-react'

export function InviteButton({ vendorId }: { vendorId: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ inviteUrl?: string; error?: string } | null>(null)

  async function handleInvite() {
    setLoading(true)
    const res = await generateAndSendInvite(vendorId)
    setResult(res)
    setLoading(false)
  }

  if (result?.inviteUrl) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
          <Check className="h-4 w-4" /> Invite sent
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigator.clipboard.writeText(result.inviteUrl!)}
        >
          <Copy className="h-3 w-3 mr-1" />Copy link
        </Button>
      </div>
    )
  }

  return (
    <div>
      <Button size="sm" onClick={handleInvite} disabled={loading}>
        <Mail className="h-4 w-4 mr-1" />
        {loading ? 'Sending…' : 'Send Invite'}
      </Button>
      {result?.error && <p className="text-xs text-destructive mt-1">{result.error}</p>}
    </div>
  )
}
