import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Users, CheckCircle2 } from 'lucide-react'

export default async function LandingPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string }
}) {
  async function subscribe(formData: FormData) {
    'use server'
    const email = (formData.get('email') as string)?.trim()
    if (!email) redirect('/?error=1')

    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_AUDIENCE_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reactivate_existing: false,
          send_welcome_email: true,
        }),
      }
    )

    if (!res.ok) redirect('/?error=1')
    redirect('/?success=1')
  }

  const submitted = !!searchParams.success

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">VendorOS</span>
          <Link
            href="/login"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Staff sign in →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-28 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <span className="size-1.5 rounded-full bg-green-400" />
          Now in early access
        </div>
        <h1 className="mb-6 text-balance text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          Vendor compliance,
          <br className="hidden md:block" />
          {' '}without the chaos.
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-muted-foreground">
          VendorOS helps construction teams collect, track, and approve subcontractor
          compliance docs — insurance certificates, licenses, and certifications — all
          in one place.
        </p>

        {submitted ? (
          <div className="inline-block rounded-xl border border-border bg-secondary/50 px-6 py-5">
            <p className="font-medium text-foreground">You&apos;re on the list.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;ll reach out when we&apos;re ready for you.
            </p>
          </div>
        ) : (
          <form action={subscribe} className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              name="email"
              type="email"
              required
              placeholder="you@company.com"
              className="h-10 flex-1 rounded-lg border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground outline-none focus:border-ring dark:bg-input/30"
            />
            <button
              type="submit"
              className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/80 whitespace-nowrap"
            >
              Get early access
            </button>
          </form>
        )}
        {searchParams.error && !submitted && (
          <p className="mt-3 text-sm text-red-400">Something went wrong. Please try again.</p>
        )}
      </section>

      {/* Features */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="mb-12 text-center text-2xl font-bold">
            Everything you need to stay compliant
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: <FileText className="size-5" />,
                title: 'Track every document',
                body: 'Centralized dashboard for all vendor certificates, licenses, and insurance docs. Automatic alerts before anything expires.',
              },
              {
                icon: <Users className="size-5" />,
                title: 'Self-serve vendor portal',
                body: 'Each vendor gets a private link to upload their documents directly. No more chasing PDFs over email.',
              },
              {
                icon: <CheckCircle2 className="size-5" />,
                title: 'Review and approve instantly',
                body: 'One-click approve or request revisions from a clean review queue. Full audit trail included.',
              },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                  {f.icon}
                </div>
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-secondary/20">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-12 text-center text-2xl font-bold">Up and running in minutes</h2>
          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Add your vendors',
                body: 'Import your subcontractor list and define the compliance documents required from each.',
              },
              {
                step: '02',
                title: 'Vendors upload directly',
                body: 'Send each vendor their private portal link. They upload their docs — you stop chasing.',
              },
              {
                step: '03',
                title: 'Stay in control',
                body: 'Review submissions, approve or request revisions, and get notified before anything expires.',
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs font-bold text-muted-foreground">
                  {s.step}
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to get organized?</h2>
          <p className="mb-8 text-muted-foreground">
            Join construction teams already using VendorOS to stay on top of vendor compliance.
          </p>
          {submitted ? (
            <p className="text-sm text-muted-foreground">You&apos;re already on the list.</p>
          ) : (
            <form action={subscribe} className="mx-auto flex max-w-sm flex-col gap-3 sm:flex-row">
              <input
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="h-10 flex-1 rounded-lg border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground outline-none focus:border-ring dark:bg-input/30"
              />
              <button
                type="submit"
                className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/80 whitespace-nowrap"
              >
                Get early access
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} VendorOS. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
