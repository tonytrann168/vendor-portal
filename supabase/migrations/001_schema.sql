-- supabase/migrations/001_schema.sql

CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin','compliance','pm','accounting','field')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  trade_type text,
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'incomplete'
    CHECK (status IN ('incomplete','pending','blocked','expiring_soon','approved')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  start_date date,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','completed','archived'))
);

CREATE TABLE project_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE (project_id, vendor_id)
);

CREATE TABLE document_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  owner_role text NOT NULL CHECK (owner_role IN ('compliance','accounting','pm','safety')),
  is_required boolean NOT NULL DEFAULT true,
  requires_expiration boolean NOT NULL DEFAULT false
);

CREATE TABLE vendor_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  requirement_id uuid NOT NULL REFERENCES document_requirements(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','expired')),
  expiration_date date,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  rejection_reason text,
  uploaded_at timestamptz DEFAULT now()
);

CREATE TABLE approval_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES vendor_documents(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('uploaded','approved','rejected','revision_requested','expired')),
  performed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE vendor_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  email text NOT NULL,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz
);

-- Indexes for common queries
CREATE INDEX idx_vendors_company ON vendors(company_id);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendor_documents_vendor ON vendor_documents(vendor_id);
CREATE INDEX idx_vendor_documents_requirement ON vendor_documents(requirement_id);
CREATE INDEX idx_vendor_documents_uploaded_at ON vendor_documents(vendor_id, requirement_id, uploaded_at DESC);
CREATE INDEX idx_approval_log_vendor ON approval_log(vendor_id);
CREATE INDEX idx_vendor_invites_token ON vendor_invites(token);
