'use client'
import { useState } from 'react'
import { reviewDocument } from '@/lib/actions/documents'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Check, X, RotateCcw } from 'lucide-react'

interface ReviewActionsProps {
  documentId: string
  vendorId: string
  onComplete?: () => void
}

export function ReviewActions({ documentId, vendorId, onComplete }: ReviewActionsProps) {
  const [action, setAction] = useState<'rejected' | 'revision_requested' | null>(null)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(a: 'approved' | 'rejected' | 'revision_requested') {
    setLoading(true)
    setError('')
    const result = await reviewDocument({ documentId, vendorId, action: a, reason: reason.trim() || undefined })
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setAction(null)
      setReason('')
      onComplete?.()
    }
  }

  if (action) {
    return (
      <div className="space-y-3">
        <Label>
          {action === 'rejected' ? 'Rejection reason (required)' : 'Revision note (required)'}
        </Label>
        <Textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder={action === 'rejected' ? 'Explain why this document is rejected…' : 'Describe what needs to be revised…'}
          rows={3}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button
            onClick={() => submit(action)}
            disabled={loading || !reason.trim()}
            variant={action === 'rejected' ? 'destructive' : 'default'}
          >
            {loading ? 'Saving…' : action === 'rejected' ? 'Confirm Reject' : 'Request Revision'}
          </Button>
          <Button variant="outline" onClick={() => { setAction(null); setReason('') }}>Cancel</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <Button onClick={() => submit('approved')} disabled={loading} className="bg-green-600 hover:bg-green-700">
        <Check className="h-4 w-4 mr-1" />Approve
      </Button>
      <Button variant="destructive" onClick={() => setAction('rejected')} disabled={loading}>
        <X className="h-4 w-4 mr-1" />Reject
      </Button>
      <Button variant="outline" onClick={() => setAction('revision_requested')} disabled={loading}>
        <RotateCcw className="h-4 w-4 mr-1" />Request Revision
      </Button>
    </div>
  )
}
