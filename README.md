# VendorOS — Vendor Approval OS for Construction

A workflow platform for GC companies to manage vendor compliance. Vendors upload required documents through a mobile-friendly portal; compliance teams review and approve them.

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd vendor-portal
npm install
```

### 2. Create a Supabase project

Create a project at supabase.com. Copy your Project URL and API keys.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to find it |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase dashboard → Settings → API |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase dashboard → Settings → API (anon public) |
| SUPABASE_SERVICE_ROLE_KEY | Supabase dashboard → Settings → API (service_role — keep secret) |
| RESEND_API_KEY | resend.com → API Keys |
| NEXT_PUBLIC_APP_URL | `http://localhost:3000` for local, your domain in production |

### 4. Run database migrations

In the Supabase SQL Editor, run each file in order:
1. `supabase/migrations/001_schema.sql`
2. `supabase/migrations/002_rls.sql`
3. `supabase/migrations/003_functions.sql`

### 5. Create Supabase Storage bucket

Dashboard → Storage → New bucket:
- Name: `vendor-docs`
- Public: No

### 6. Seed demo data

In the Supabase SQL Editor:
1. Create 3 auth users: `admin@apexconstruction.com`, `compliance@apexconstruction.com`, `pm@apexconstruction.com` (password: `Admin1234!`)
2. Run `supabase/seed.sql`

### 7. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000. Log in with `admin@apexconstruction.com` / `Admin1234!`.

## Architecture

- All data fetching via Supabase SSR server components (no API routes)
- All mutations via Next.js Server Actions
- Vendor status computed exclusively by `compute_vendor_status()` Postgres function
- Document re-uploads always INSERT a new row — rejected rows are never modified
- Current document per (vendor, requirement) = `ORDER BY uploaded_at DESC LIMIT 1`
- Nightly pg_cron job re-evaluates all vendor statuses at midnight UTC

## Roles

| Role | Can do |
|---|---|
| admin | Everything |
| compliance | Review compliance/safety docs, manage requirements, send invites |
| pm | Review PM docs, assign vendors to projects, send invites |
| accounting | Review accounting docs |
| field | Read-only |
