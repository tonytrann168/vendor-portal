'use client'

interface DocumentPreviewProps {
  fileUrl: string
  fileName: string
}

function isPdf(name: string) {
  return name.toLowerCase().endsWith('.pdf')
}

export function DocumentPreview({ fileUrl, fileName }: DocumentPreviewProps) {
  return (
    <div className="w-full rounded-md overflow-hidden border bg-muted/30" style={{ height: 480 }}>
      {isPdf(fileName) ? (
        <iframe src={fileUrl} className="w-full h-full" title={fileName} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={fileUrl} alt={fileName} className="w-full h-full object-contain" />
      )}
    </div>
  )
}
