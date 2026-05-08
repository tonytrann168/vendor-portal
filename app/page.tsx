'use client'

import { useState } from 'react'
import * as gtag from '@/lib/gtag'

const heroVendors = [
  { name: 'Garcia Electrical', trade: 'Electrical', status: 'approved' as const },
  { name: 'Martinez Plumbing', trade: 'Plumbing', status: 'expiring' as const },
  { name: 'Superior HVAC', trade: 'HVAC', status: 'expired' as const },
  { name: 'Pacific Demo Co.', trade: 'Demolition', status: 'pending' as const },
  { name: 'Quick Concrete', trade: 'Concrete', status: 'missing' as const },
]

const statusConfig = {
  approved: { label: 'Approved', badge: 'bg-green-50 text-green-700 border border-green-100', dot: 'bg-green-500' },
  expiring: { label: 'COI Expiring', badge: 'bg-amber-50 text-amber-700 border border-amber-100', dot: 'bg-amber-400' },
  expired:  { label: 'Expired',      badge: 'bg-red-50 text-red-700 border border-red-100',     dot: 'bg-red-500'   },
  pending:  { label: 'Pending Review',badge: 'bg-blue-50 text-blue-700 border border-blue-100',  dot: 'bg-blue-400'  },
  missing:  { label: 'Missing Docs', badge: 'bg-orange-50 text-orange-700 border border-orange-100', dot: 'bg-orange-500' },
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent, label = 'hero_form') => {
    e.preventDefault()
    setStatus('loading')
    gtag.event({ action: 'submit_waitlist', category: 'engagement', label })
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setEmail('')
        gtag.event({ action: 'waitlist_success', category: 'conversion', label })
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong')
      }
    } catch {
      setStatus('error')
      setMessage('Failed to connect. Try again.')
    }
  }

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="bg-white text-gray-900 font-sans antialiased">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">VendorOS</span>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-gray-900 transition-colors">How It Works</button>
            <button onClick={() => scrollTo('visibility')} className="hover:text-gray-900 transition-colors">Product</button>
            <button
              onClick={() => scrollTo('waitlist')}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              Request Access
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-32 grid md:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Built for construction teams
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05] text-gray-900">
            Stop chasing vendor documents across emails, texts, and spreadsheets.
          </h1>

          <p className="text-xl text-gray-500 leading-relaxed max-w-xl">
            Automatically collect COIs, W-9s, licenses, and compliance documents from vendors — then track approvals, expirations, and status in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {status === 'success' ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 bg-green-50 text-green-700 rounded-xl font-semibold border border-green-100 text-sm">
                ✓ You&apos;re on the list — we&apos;ll be in touch.
              </div>
            ) : (
              <>
                <form onSubmit={(e) => handleSubmit(e, 'hero_form')} className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Work email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-52 transition-all"
                    disabled={status === 'loading'}
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="bg-gray-900 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-gray-700 transition-all disabled:opacity-50 whitespace-nowrap"
                  >
                    {status === 'loading' ? 'Sending...' : 'Request Early Access'}
                  </button>
                </form>
                <button
                  onClick={() => scrollTo('how-it-works')}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  See How It Works →
                </button>
              </>
            )}
          </div>
          {status === 'error' && <p className="text-sm text-red-600">{message}</p>}

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> No login required for vendors</span>
            <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Mobile-friendly uploads</span>
            <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Built for construction</span>
          </div>
        </div>

        {/* Right — Dashboard Mockup */}
        <div className="relative">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-5">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-50">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Active Project</p>
                <p className="font-semibold text-gray-900 text-sm">Riverside Commercial — Phase 2</p>
              </div>
              <span className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full font-medium border border-gray-100">
                12 vendors
              </span>
            </div>
            <div className="space-y-2">
              {heroVendors.map((v) => {
                const cfg = statusConfig[v.status]
                const initials = v.name.split(' ').map((w) => w[0]).join('').slice(0, 2)
                return (
                  <div key={v.name} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 leading-none mb-0.5">{v.name}</p>
                        <p className="text-xs text-gray-400">{v.trade}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-400">2 vendors need attention</span>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Send Reminders →
              </button>
            </div>
          </div>
          {/* Floating alert */}
          <div className="absolute -bottom-4 -left-4 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-sm">⚠️</div>
            <div>
              <p className="text-xs font-semibold text-gray-900">COI expires in 7 days</p>
              <p className="text-[11px] text-gray-400">Martinez Plumbing</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PAIN SECTION ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">The Reality Today</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Vendor compliance is held together<br className="hidden md:block" /> by duct tape and prayers.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                scenario: '"Still waiting on their COI. Project starts Monday."',
                detail: "You've sent 4 emails. No response. You're about to start a project with an unverified vendor.",
                label: 'EMAIL CHASE',
                border: 'border-red-100',
                labelColor: 'text-red-500',
              },
              {
                scenario: '"Where do I send the W-9? Just text me the email."',
                detail: "Vendors don't know where to send things. Documents scatter across inboxes, texts, and Google Drives.",
                label: 'DOCUMENT CHAOS',
                border: 'border-orange-100',
                labelColor: 'text-orange-500',
              },
              {
                scenario: '"Their insurance expired 3 weeks ago. Nobody caught it."',
                detail: "A field audit reveals an expired certificate. The vendor was on-site the whole time. Now you're exposed.",
                label: 'COMPLIANCE RISK',
                border: 'border-amber-100',
                labelColor: 'text-amber-600',
              },
            ].map((item) => (
              <div key={item.label} className={`bg-white rounded-2xl p-6 border ${item.border} shadow-sm`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${item.labelColor}`}>{item.label}</p>
                <p className="text-base font-semibold text-gray-900 mb-3 leading-snug">{item.scenario}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Three steps to vendor clarity.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                n: '1',
                title: 'Invite your vendor',
                desc: 'Send a secure link via email or SMS. No account creation. No app downloads. Just a link.',
                note: 'Works from any phone or computer',
              },
              {
                n: '2',
                title: 'Vendor uploads their docs',
                desc: "They see exactly what's needed. Upload directly from their phone or desktop in under 2 minutes.",
                note: 'COIs, W-9s, licenses, and more',
              },
              {
                n: '3',
                title: 'You review and approve',
                desc: 'Everything lands in your dashboard. One-click approve, request revisions, or flag for follow-up.',
                note: 'Full audit trail included',
              },
            ].map((step) => (
              <div key={step.n} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-black text-lg mx-auto mb-6">
                  {step.n}
                </div>
                <h3 className="font-bold text-lg mb-3 text-gray-900">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">{step.desc}</p>
                <p className="text-xs text-gray-400 font-medium">{step.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KNOW INSTANTLY ── */}
      <section id="visibility" className="bg-gray-50 border-y border-gray-100 py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Approval Visibility</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Know instantly who&apos;s approved.
            </h2>
            <p className="text-xl text-gray-500 leading-relaxed">
              No more digging through emails. Every vendor&apos;s compliance status is visible at a glance — approved, expiring, expired, or missing.
            </p>
            <div className="space-y-2.5 pt-2">
              {[
                { icon: '✅', label: 'Approved', desc: 'All documents verified and current' },
                { icon: '⚠️', label: 'Expiring Soon', desc: 'COI or license renewal needed within 30 days' },
                { icon: '❌', label: 'Expired', desc: 'Document lapsed — immediate action required' },
                { icon: '⏳', label: 'Pending Review', desc: 'Documents uploaded, awaiting your approval' },
                { icon: '🚫', label: 'Missing Docs', desc: "Vendor hasn't submitted yet" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-100">
                  <span className="text-base">{s.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{s.label}</p>
                    <p className="text-xs text-gray-400">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status mockup */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Vendor Compliance</p>
              <span className="text-xs text-gray-400">Updated just now</span>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { name: 'Garcia Electrical', docs: 'COI · W-9 · License', status: 'approved' as const },
                { name: 'Martinez Plumbing', docs: 'COI expires Jul 15', status: 'expiring' as const },
                { name: 'Superior HVAC', docs: 'Insurance expired Jun 1', status: 'expired' as const },
                { name: 'Pacific Demo Co.', docs: 'W-9 under review', status: 'pending' as const },
                { name: 'Quick Concrete LLC', docs: 'Missing: COI + W-9', status: 'missing' as const },
                { name: 'Apex Roofing', docs: 'COI · W-9 · License', status: 'approved' as const },
              ].map((v) => {
                const cfg = statusConfig[v.status]
                const initials = v.name.split(' ').map((w) => w[0]).join('').slice(0, 2)
                return (
                  <div key={v.name} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{v.name}</p>
                        <p className="text-xs text-gray-400">{v.docs}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── NO ACCOUNT NEEDED ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Phone mockup */}
          <div className="flex justify-center">
            <div className="bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl w-[260px]">
              <div className="bg-white rounded-[2rem] overflow-hidden">
                <div className="bg-gray-900 h-6 flex items-center justify-center">
                  <div className="w-16 h-1.5 bg-gray-700 rounded-full" />
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-[11px] text-gray-400 mb-0.5">From: Riverside Commercial</p>
                    <p className="text-sm font-semibold text-gray-900 leading-snug">Upload your compliance documents</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                      <span className="text-xs font-medium text-green-800">Certificate of Insurance</span>
                      <span className="text-xs text-green-600 font-bold">✓</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <span className="text-xs font-medium text-blue-800">W-9 Form</span>
                      <span className="text-xs text-blue-600 font-bold">↑ Upload</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-xs font-medium text-gray-500">Business License</span>
                      <span className="text-xs text-gray-400">Pending</span>
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold">
                    Upload W-9 →
                  </button>
                  <p className="text-[10px] text-center text-gray-400">No account required · Encrypted</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vendor Experience</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Vendors upload without creating an account.
            </h2>
            <p className="text-xl text-gray-500 leading-relaxed">
              Construction vendors hate software. So we made it frictionless. They get a secure link, see exactly what&apos;s needed, and upload from their phone in minutes.
            </p>
            <div className="space-y-5 pt-2">
              {[
                { icon: '🔗', title: 'Secure upload link', desc: 'Sent via email or SMS — no password, no account creation' },
                { icon: '📱', title: 'Works on any phone', desc: 'Take a photo of a document and upload instantly from the field' },
                { icon: '✅', title: 'Clear checklist', desc: 'Vendors see exactly what is missing — nothing more, nothing less' },
              ].map((f) => (
                <div key={f.title} className="flex gap-4">
                  <span className="text-xl mt-0.5">{f.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-0.5">{f.title}</p>
                    <p className="text-sm text-gray-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPIRATION TRACKING ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Expiration Tracking</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Never get surprised by an expired document again.
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              VendorOS tracks every expiration date and sends automated reminders before documents lapse — so you stay ahead, not caught off guard.
            </p>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {[
              { days: '30 days',  vendor: 'Martinez Plumbing', doc: 'Certificate of Insurance',   bg: 'bg-blue-50',   border: 'border-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-400'   },
              { days: '14 days',  vendor: 'Apex Roofing',      doc: 'General Liability Policy',   bg: 'bg-amber-50',  border: 'border-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-400'  },
              { days: '7 days',   vendor: 'Superior HVAC',     doc: 'Workers Comp Insurance',     bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
              { days: 'Expired',  vendor: 'Delta Flooring',    doc: 'Business License',           bg: 'bg-red-50',    border: 'border-red-100',    text: 'text-red-700',    dot: 'bg-red-500'    },
            ].map((alert) => (
              <div key={alert.vendor} className={`flex items-center justify-between p-4 rounded-xl border ${alert.border} ${alert.bg}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${alert.dot}`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{alert.vendor}</p>
                    <p className="text-xs text-gray-500">{alert.doc}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${alert.border} ${alert.text} bg-white`}>
                  {alert.days}
                </span>
              </div>
            ))}
            <p className="text-center text-xs text-gray-400 pt-2">
              Automated reminders sent to vendors at 30, 14, and 7 days before expiration
            </p>
          </div>
        </div>
      </section>

      {/* ── AUTOMATION ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Workflow Automation</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Less manual work.<br className="hidden md:block" /> More operational control.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🔔',
                title: 'Automated reminders',
                desc: 'System nudges vendors when documents are missing or expiring. You stop being the messenger.',
              },
              {
                icon: '📋',
                title: 'Compliance detection',
                desc: 'VendorOS identifies document type on upload and validates required fields automatically.',
              },
              {
                icon: '📊',
                title: 'Project-level visibility',
                desc: 'See compliance status across every vendor on every active project from a single dashboard.',
              },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 bg-white">
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section id="waitlist" className="bg-gray-900 py-28 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Finally, someone fixed this nightmare.
          </h2>
          <p className="text-xl text-gray-400 leading-relaxed">
            Join construction teams getting early access to VendorOS. We&apos;re onboarding 5 pilot teams now.
          </p>
          {status === 'success' ? (
            <div className="inline-flex items-center gap-2 px-6 py-4 bg-green-900/40 text-green-400 rounded-xl font-semibold border border-green-800 text-sm">
              ✓ You&apos;re on the list — we&apos;ll be in touch soon.
            </div>
          ) : (
            <form onSubmit={(e) => handleSubmit(e, 'footer_form')} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Work email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3.5 rounded-xl border border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-white text-gray-900 px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-all disabled:opacity-50 whitespace-nowrap"
              >
                {status === 'loading' ? 'Sending...' : 'Request Early Access'}
              </button>
            </form>
          )}
          {status === 'error' && <p className="text-sm text-red-400">{message}</p>}
          <p className="text-sm text-gray-500 italic">Early access opening soon. Limited spots.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 py-10 px-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span className="font-semibold text-gray-600">VendorOS</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Contact</a>
          </div>
          <span>© {new Date().getFullYear()} VendorOS. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
