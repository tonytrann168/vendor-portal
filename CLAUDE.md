# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A multi-tenant vendor compliance platform. Construction companies use the staff dashboard to manage subcontractors and track their compliance documents (insurance, licenses, certifications). Vendors get a separate self-serve portal to upload their documents. Staff then review and approve/reject them.

## Commands

```bash
npm run dev      # dev server (port 3000, or next available)
npm run build    # production build — runs ESLint, must pass clean
npm run lint     # ESLint only
```

No test suite.

## Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
NEXT_PUBLIC_APP_URL
```

## Directory Structure

```
app/
  (auth)/login/         — staff login page
  (dashboard)/          — all staff-facing pages (auth-gated)
  portal/               — vendor-facing pages (public)
  auth/callback/        — Supabase OAuth/magic-link callback
  auth/signout/         — POST route handler for logout
components/
  ui/                   — base primitives (Button, Card, Input, etc.)
  layout/               — Sidebar, TopBar, SettingsNav
  dashboard/            — stat cards, vendor table, activity feed, expiring docs
  documents/            — document preview, review actions, queue filters
  portal/               — requirement card, upload form
  shared/               — StatusBadge, EmptyState, SkeletonCard
  vendors/              — AddVendorDialog, InviteButton
lib/
  actions/              — all server actions (mutations)
  supabase/             — three client factories (server, client, admin)
  types.ts              — hand-maintained DB types + app union types
  email.ts              — Resend wrapper
  utils.ts              — cn() helper
supabase/
  migrations/           — 001 schema, 002 RLS, 003 functions+trigger
  seed.sql              — sample data (requires auth users to exist first)
```

## Two Apps in One

**Staff dashboard** (`app/(dashboard)/`) — authenticated internal users. Middleware enforces session on every route except `/login`, `/portal/*`, `/auth/*`.

**Vendor portal** (`app/portal/`) — public-facing. Invite flow: staff sends invite → vendor clicks link → `/portal/invite/[token]` validates token and sends a magic link → vendor authenticates → `/portal/[vendorId]/checklist` → `/portal/[vendorId]/upload/[requirementId]`.

The `/auth/callback` route handles both staff OAuth and vendor magic-link logins. It detects `type=vendor` in the URL to link the new auth user to the existing vendors row.

## Supabase Client Selection

Three clients — pick the right one every time:

| Client | File | When to use |
|--------|------|-------------|
| Server | `lib/supabase/server.ts` | Server components, server actions |
| Browser | `lib/supabase/client.ts` | `'use client'` components |
| Admin | `lib/supabase/admin.ts` | Bypasses RLS — invite flow only (vendor has no auth session yet) |

## Key Conventions

**Server actions** — all mutations live in `lib/actions/`. Every action: (1) verifies session, (2) checks role, (3) mutates, (4) calls `revalidatePath()`. Actions that return non-void need the cast `action={fn as unknown as (fd: FormData) => Promise<void>}` on form elements.

**Vendor status** is computed by the `compute_vendor_status(vendor_id)` Postgres function. A trigger fires it automatically on every `vendor_documents` INSERT or UPDATE. Never write `vendors.status` from application code.

Status priority: `blocked` → `incomplete` → `pending` → `expiring_soon` → `approved`.

**Document versioning** — uploads always INSERT a new `vendor_documents` row; never update a previous one. The "latest" document per requirement is `ORDER BY uploaded_at DESC LIMIT 1`.

**`revision_requested`** is not a document status — it keeps status as `pending` but sets `rejection_reason` so the vendor knows what to fix. The vendor then re-uploads (new row).

**Multi-tenancy** — all tables have `company_id`. RLS policies use the helper functions `auth_company_id()` and `auth_user_role()` to enforce row isolation. Never filter by company_id manually in queries; RLS handles it.

**Supabase join types** — `.select('*, vendors(*)')` returns joined data that TypeScript can't fully infer. Cast with `// eslint-disable-next-line @typescript-eslint/no-explicit-any` on a local variable before the JSX return — not inline `as any` inside JSX.

## UI Patterns

**`@base-ui/react` does not support `asChild`** — use the `render` prop pattern or `buttonVariants()` with a plain `<Link className={buttonVariants(...)}>` instead.

**Tailwind v3** — the `shadcn/tailwind.css` and `tw-animate-css` imports use Tailwind v4 syntax and will break the build. Don't add them. Animations come from the `tailwindcss-animate` plugin. Opacity modifiers on CSS variable colors (e.g. `ring/50`) don't work in v3.

## Types

`lib/types.ts` is hand-maintained. The `Database` type **must** include `__InternalSupabase: { PostgrestVersion: "14.5" }` at the top level or all Supabase query return types collapse to `never`. Do not remove it.

App-level union types (`VendorStatus`, `DocumentStatus`, `UserRole`, etc.) and composite types (`RequirementWithLatestDoc`, `VendorWithLatestDocs`) are defined at the bottom of the same file.

## Storage

Bucket: `vendor-docs`. Path format: `{company_id}/{vendor_id}/{requirement_id}/{timestamp}.{ext}`. RLS policies on `storage.objects` restrict uploads to authenticated vendors and reads to authenticated staff/vendors.

## Before Shipping

- `seed.sql` depends on auth users existing first — create them in Supabase Auth before seeding
- Apply `004_recompute_rpc.sql` migration and deploy the `nightly-status-recompute` Edge Function
- Set `project_id` in `supabase/config.toml` to your Supabase project ID
