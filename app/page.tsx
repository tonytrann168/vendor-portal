'use client';

import { useState } from 'react';
import * as gtag from '@/lib/gtag';

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent, label: string = 'hero_form') => {
    e.preventDefault();
    setStatus('loading');

    gtag.event({
      action: 'submit_waitlist',
      category: 'engagement',
      label: label,
    });

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setEmail('');
        gtag.event({
          action: 'waitlist_success',
          category: 'conversion',
          label: label,
        });
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to connect to the server');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Hero Section */}
      <header className="px-6 py-16 md:py-28 max-w-6xl mx-auto w-full text-center md:text-left flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
          <div className="inline-block px-4 py-1.5 bg-accent-soft text-accent rounded-full font-bold text-xs tracking-wider uppercase">
            Built for Construction & Property Teams
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Stop chasing vendor documents at 7PM
          </h1>
          <p className="text-xl md:text-2xl text-text-muted max-w-2xl leading-relaxed">
            VendorOS brings every vendor, every document, and every deadline into one place—so your team stops chasing and starts building.
          </p>
          <div className="w-full max-w-md pt-4">
            {status === 'success' ? (
              <div className="bg-green-50 text-green-700 p-6 rounded-xl font-semibold border border-green-200 shadow-sm animate-in fade-in zoom-in duration-300">
                ✓ You&apos;re on the list! We&apos;ll be in touch soon.
              </div>
            ) : (
              <div className="space-y-4">
                <form onSubmit={(e) => handleSubmit(e, 'hero_form')} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your work email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent transition-all text-lg shadow-sm"
                    disabled={status === 'loading'}
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="bg-accent text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md disabled:opacity-50"
                  >
                    {status === 'loading' ? 'Joining...' : 'Join the Waitlist'}
                  </button>
                </form>
                <p className="text-sm text-text-muted text-center md:text-left pl-1">
                  Used by teams who are tired of chasing vendors through email, text, and spreadsheets.
                </p>
              </div>
            )}
            {status === 'error' && (
              <p className="mt-3 text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{message}</p>
            )}
          </div>
        </div>

        {/* Product Mockup Preview */}
        <div className="flex-1 w-full max-w-md bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-accent"></div>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div className="h-5 w-32 bg-gray-100 rounded-md"></div>
              <div className="h-8 w-20 bg-accent-soft text-accent rounded-full text-xs flex items-center justify-center font-bold">Active</div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-xl border border-gray-50 bg-gray-50/30">
                <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center">📄</div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-2.5 w-1/2 bg-gray-100 rounded"></div>
                </div>
                <div className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold border border-red-100">MISSING</div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-xl border border-gray-50">
                <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center">🏢</div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-2/3 bg-gray-200 rounded"></div>
                  <div className="h-2.5 w-1/3 bg-gray-100 rounded"></div>
                </div>
                <div className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold border border-green-100">VERIFIED</div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-xl border border-gray-50">
                <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center">📝</div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-1/2 bg-gray-200 rounded"></div>
                  <div className="h-2.5 w-1/4 bg-gray-100 rounded"></div>
                </div>
                <div className="px-2.5 py-1 bg-yellow-50 text-yellow-600 rounded-full text-[10px] font-bold border border-yellow-100">EXPIRED</div>
              </div>
            </div>

            <div className="pt-2">
              <button className="w-full h-12 bg-accent text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all">
                Send Automatic Reminders
              </button>
            </div>
          </div>

          {/* Floating UI Element */}
          <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 animate-bounce-slow">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>
              <div className="text-xs font-bold">New Document Uploaded</div>
            </div>
          </div>
        </div>
      </header>

      {/* Pain Recognition Section */}
      <section className="bg-gray-50/50 py-24 px-6 border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Paperwork shouldn&apos;t hold up production.</h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">Managing vendors manually is slow, risky, and expensive.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Vendors forget to send documents",
                desc: "You're 2 days from project start. Still waiting on that W-9. You send another email. No response. Now you're rescheduling.",
                icon: "📧"
              },
              {
                title: "Your PM spends hours chasing paperwork",
                desc: "Email. Text. Slack. Drive. You're not building—you're chasing. And your PM should be managing the project, not hunting down documents.",
                icon: "📱"
              },
              {
                title: "Missing docs delay everything",
                desc: "One expired insurance cert. One missing signed contract. That's all it takes to halt a project and cost you relationships.",
                icon: "⚠️"
              }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-accent/20 transition-colors">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-28 px-6 max-w-5xl mx-auto w-full">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">The 4-Step Automation</h2>
          <p className="text-lg text-text-muted">How VendorOS fixes your document chaos.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
          {[
            {
              step: "01",
              title: "Invite your vendor",
              desc: "Send one link. No more email chains."
            },
            {
              step: "02",
              title: "They upload their documents",
              desc: "Vendors upload directly. No chasing."
            },
            {
              step: "03",
              title: "You review and approve",
              desc: "See everything in one dashboard. Approve with one click."
            },
            {
              step: "04",
              title: "Automatic reminders",
              desc: "System nudges vendors (and you) when something's missing or expiring."
            }
          ].map((item) => (
            <div key={item.step} className="flex gap-6 items-start group">
              <div className="flex-shrink-0 w-12 h-12 bg-accent-soft text-accent rounded-2xl flex items-center justify-center font-black text-lg group-hover:bg-accent group-hover:text-white transition-colors">
                {item.step}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold">{item.title}</h3>
                <p className="text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-accent text-white px-10 py-4 rounded-xl font-bold text-xl hover:bg-blue-600 transition-all shadow-md"
          >
            Join the Waitlist
          </button>
        </div>
      </section>

      {/* Value Proposition / Outcome Section */}
      <section className="bg-accent py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full -ml-32 -mb-32"></div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 text-center relative z-10">
          <div className="space-y-2">
            <div className="text-5xl font-black text-white mb-2">5+</div>
            <div className="text-blue-50 font-bold uppercase tracking-widest text-xs">Save 5+ hours per week</div>
            <p className="text-blue-100/80 text-sm">No more &quot;just checking in&quot; emails. No more tracking documents in 5 different places.</p>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-black text-white mb-2">100%</div>
            <div className="text-blue-50 font-bold uppercase tracking-widest text-xs">Reduce compliance risk</div>
            <p className="text-blue-100/80 text-sm">Never miss an expiration date. Never start a project with expired insurance.</p>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-black text-white mb-2">One</div>
            <div className="text-blue-50 font-bold uppercase tracking-widest text-xs">Centralize everything</div>
            <p className="text-blue-100/80 text-sm">Every vendor. Every document. Every deadline. One place.</p>
          </div>
        </div>
      </section>

      {/* Scarcity / Early Access Section */}
      <section className="py-28 px-6 text-center max-w-4xl mx-auto">
        <div className="bg-accent-soft/50 rounded-3xl p-12 border border-accent/10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6">Looking for pilot users</h2>
          <p className="text-xl text-text-muted mb-10 leading-relaxed max-w-2xl mx-auto">
            We&apos;re giving 5 construction teams early access—and a discount on launch pricing.
          </p>
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-accent text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition-all shadow-md"
            >
              Apply for Early Access
            </button>
            <p className="text-sm text-text-muted">
              We&apos;re building this with contractors, for contractors. Your feedback shapes the product.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gray-50 py-28 px-6 text-center border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black mb-6 tracking-tight">Your vendors won&apos;t chase themselves. But now you don&apos;t have to either.</h2>
          <p className="text-lg text-text-muted mb-10 leading-relaxed">
            Join 500+ contractors and PMs already on the waitlist.
          </p>
          <div className="max-w-md mx-auto">
            {status === 'success' ? (
              <div className="bg-green-50 text-green-700 p-6 rounded-xl font-semibold border border-green-200">
                ✓ You&apos;re on the list!
              </div>
            ) : (
              <form onSubmit={(e) => handleSubmit(e, 'footer_form')} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your work email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm text-lg"
                  disabled={status === 'loading'}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-accent text-white px-10 py-4 rounded-xl font-bold text-xl hover:bg-blue-600 transition-all shadow-md disabled:opacity-50"
                >
                  {status === 'loading' ? 'Join' : 'Join the Waitlist'}
                </button>
              </form>
            )}
          </div>
          <p className="mt-8 text-text-muted font-medium italic">Early access opening soon. Limited spots available.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-gray-100 text-center text-text-muted text-sm font-medium">
        <div className="flex justify-center gap-8 mb-8">
          <a href="#" className="hover:text-accent transition-colors">Privacy</a>
          <a href="#" className="hover:text-accent transition-colors">Terms</a>
          <a href="#" className="hover:text-accent transition-colors">Contact</a>
        </div>
        &copy; {new Date().getFullYear()} VendorOS. All rights reserved. Stop chasing. Start building.
      </footer>
    </div>
  );
}
