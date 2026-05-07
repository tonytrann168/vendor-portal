import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_AUDIENCE_ID}/subscriptions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        reactivate_existing: false,
        send_welcome_email: true,
      }),
    }
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
