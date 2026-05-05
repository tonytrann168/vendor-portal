import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVendorInvite({
  to,
  vendorName,
  companyName,
  inviteUrl,
}: {
  to: string
  vendorName: string
  companyName: string
  inviteUrl: string
}) {
  const { data, error } = await resend.emails.send({
    from: 'VendorOS <noreply@vendor-docs.app>',
    to,
    subject: `${companyName} has invited you to submit compliance documents`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Hello ${vendorName},</h2>
        <p><strong>${companyName}</strong> has invited you to submit your compliance documents through VendorOS.</p>
        <p>Click the button below to get started:</p>
        <a href="${inviteUrl}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:6px;font-weight:600;">
          View Document Checklist
        </a>
        <p style="margin-top:24px;color:#6b7280;font-size:13px;">
          This link expires in 7 days. If you have questions, reply to this email.
        </p>
      </div>
    `,
  })
  return { data, error }
}
