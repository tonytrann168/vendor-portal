-- supabase/migrations/002_rls.sql

-- Helper function: get current user's company_id
CREATE OR REPLACE FUNCTION auth_company_id()
RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT company_id FROM users WHERE id = auth.uid()
$$;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$;

-- companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff see own company" ON companies FOR SELECT
  USING (id = auth_company_id());

-- users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff see own company users" ON users FOR SELECT
  USING (company_id = auth_company_id());
CREATE POLICY "admin insert users" ON users FOR INSERT
  WITH CHECK (company_id = auth_company_id() AND auth_user_role() = 'admin');
CREATE POLICY "admin update users" ON users FOR UPDATE
  USING (company_id = auth_company_id() AND auth_user_role() = 'admin');

-- vendors
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff see own company vendors" ON vendors FOR SELECT
  USING (
    company_id = auth_company_id()
    OR auth_user_id = auth.uid()
  );
CREATE POLICY "staff insert vendors" ON vendors FOR INSERT
  WITH CHECK (company_id = auth_company_id());
CREATE POLICY "staff update vendors" ON vendors FOR UPDATE
  USING (company_id = auth_company_id());
CREATE POLICY "vendor update own auth_user_id" ON vendors FOR UPDATE
  USING (auth_user_id = auth.uid() OR auth_user_id IS NULL);

-- projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff see own company projects" ON projects FOR SELECT
  USING (company_id = auth_company_id());
CREATE POLICY "staff insert projects" ON projects FOR INSERT
  WITH CHECK (company_id = auth_company_id());
CREATE POLICY "staff update projects" ON projects FOR UPDATE
  USING (company_id = auth_company_id());

-- project_vendors
ALTER TABLE project_vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff see project vendors" ON project_vendors FOR SELECT
  USING (
    project_id IN (SELECT id FROM projects WHERE company_id = auth_company_id())
  );
CREATE POLICY "staff manage project vendors" ON project_vendors FOR ALL
  USING (
    project_id IN (SELECT id FROM projects WHERE company_id = auth_company_id())
  );

-- document_requirements
ALTER TABLE document_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff see own requirements" ON document_requirements FOR SELECT
  USING (
    company_id = auth_company_id()
    OR company_id IN (
      SELECT company_id FROM vendors WHERE auth_user_id = auth.uid()
    )
  );
CREATE POLICY "admin manage requirements" ON document_requirements FOR ALL
  USING (company_id = auth_company_id() AND auth_user_role() IN ('admin','compliance'));

-- vendor_documents
ALTER TABLE vendor_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff see company vendor docs" ON vendor_documents FOR SELECT
  USING (
    vendor_id IN (SELECT id FROM vendors WHERE company_id = auth_company_id())
  );
CREATE POLICY "vendor see own docs" ON vendor_documents FOR SELECT
  USING (
    vendor_id IN (SELECT id FROM vendors WHERE auth_user_id = auth.uid())
  );
CREATE POLICY "vendor insert own docs" ON vendor_documents FOR INSERT
  WITH CHECK (
    vendor_id IN (SELECT id FROM vendors WHERE auth_user_id = auth.uid())
  );
CREATE POLICY "reviewer update docs" ON vendor_documents FOR UPDATE
  USING (
    vendor_id IN (SELECT id FROM vendors WHERE company_id = auth_company_id())
  );

-- approval_log
ALTER TABLE approval_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff see company logs" ON approval_log FOR SELECT
  USING (
    vendor_id IN (SELECT id FROM vendors WHERE company_id = auth_company_id())
  );
CREATE POLICY "vendor see own logs" ON approval_log FOR SELECT
  USING (
    vendor_id IN (SELECT id FROM vendors WHERE auth_user_id = auth.uid())
  );
CREATE POLICY "insert log" ON approval_log FOR INSERT
  WITH CHECK (
    vendor_id IN (SELECT id FROM vendors WHERE company_id = auth_company_id())
    OR vendor_id IN (SELECT id FROM vendors WHERE auth_user_id = auth.uid())
  );

-- vendor_invites
ALTER TABLE vendor_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff see own invites" ON vendor_invites FOR SELECT
  USING (
    vendor_id IN (SELECT id FROM vendors WHERE company_id = auth_company_id())
  );
CREATE POLICY "staff insert invites" ON vendor_invites FOR INSERT
  WITH CHECK (
    vendor_id IN (SELECT id FROM vendors WHERE company_id = auth_company_id())
  );
-- Public read by token (validated in app layer)
CREATE POLICY "public read invite by token" ON vendor_invites FOR SELECT
  USING (true);
CREATE POLICY "update accepted_at" ON vendor_invites FOR UPDATE
  USING (true);
