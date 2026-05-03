'use client'
import { useRef, useState } from 'react'
import { uploadVendorDocument } from '@/lib/actions/uploads'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Paperclip, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UploadFormProps {
  vendorId: string
  requirementId: string
  requiresExpiration: boolean
}

export function UploadForm({ vendorId, requirementId, requiresExpiration }: UploadFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    formData.set('vendorId', vendorId)
    formData.set('requirementId', requirementId)

    const result = await uploadVendorDocument(formData)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      router.push(`/portal/${vendorId}/checklist`)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        {selectedFile ? (
          <div className="space-y-1">
            <Paperclip className="h-6 w-6 mx-auto text-indigo-400" />
            <p className="text-sm font-medium">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
            <p className="text-sm font-medium">Tap to upload</p>
            <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
          required
        />
      </div>

      {requiresExpiration && (
        <div className="space-y-2">
          <Label htmlFor="expirationDate">
            Expiration Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="expirationDate"
            name="expirationDate"
            type="date"
            required={requiresExpiration}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading || !selectedFile} className="w-full">
        {loading ? 'Uploading…' : 'Submit Document'}
      </Button>
    </form>
  )
}
