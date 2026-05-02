export type VendorStatus = 'incomplete' | 'pending' | 'blocked' | 'expiring_soon' | 'approved'
export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'expired'
export type UserRole = 'admin' | 'compliance' | 'pm' | 'accounting' | 'field'
export type OwnerRole = 'compliance' | 'accounting' | 'pm' | 'safety'
export type ProjectStatus = 'active' | 'completed' | 'archived'
export type ApprovalAction = 'uploaded' | 'approved' | 'rejected' | 'revision_requested' | 'expired'

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: { id: string; name: string; slug: string; logo_url: string | null; created_at: string }
        Insert: { name: string; slug: string; logo_url?: string | null }
        Update: Partial<Database['public']['Tables']['companies']['Insert']>
      }
      users: {
        Row: { id: string; company_id: string; email: string; full_name: string; role: UserRole; created_at: string }
        Insert: { id: string; company_id: string; email: string; full_name: string; role: UserRole }
        Update: Partial<{ full_name: string; role: UserRole }>
      }
      vendors: {
        Row: {
          id: string; company_id: string; name: string; email: string
          phone: string | null; trade_type: string | null
          status: VendorStatus; auth_user_id: string | null
          created_at: string; updated_at: string
        }
        Insert: { company_id: string; name: string; email: string; phone?: string | null; trade_type?: string | null }
        Update: Partial<{ name: string; email: string; phone: string | null; trade_type: string | null; auth_user_id: string | null }>
      }
      projects: {
        Row: { id: string; company_id: string; name: string; address: string | null; start_date: string | null; status: ProjectStatus }
        Insert: { company_id: string; name: string; address?: string | null; start_date?: string | null; status?: ProjectStatus }
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      project_vendors: {
        Row: { id: string; project_id: string; vendor_id: string; assigned_at: string }
        Insert: { project_id: string; vendor_id: string }
        Update: never
      }
      document_requirements: {
        Row: { id: string; company_id: string; name: string; description: string | null; owner_role: OwnerRole; is_required: boolean; requires_expiration: boolean }
        Insert: { company_id: string; name: string; description?: string | null; owner_role: OwnerRole; is_required?: boolean; requires_expiration?: boolean }
        Update: Partial<Database['public']['Tables']['document_requirements']['Insert']>
      }
      vendor_documents: {
        Row: {
          id: string; vendor_id: string; requirement_id: string
          file_url: string; file_name: string; status: DocumentStatus
          expiration_date: string | null; reviewed_by: string | null
          reviewed_at: string | null; rejection_reason: string | null
          uploaded_at: string
        }
        Insert: { vendor_id: string; requirement_id: string; file_url: string; file_name: string; expiration_date?: string | null }
        Update: Partial<{ status: DocumentStatus; expiration_date: string | null; reviewed_by: string | null; reviewed_at: string | null; rejection_reason: string | null }>
      }
      approval_log: {
        Row: { id: string; vendor_id: string; document_id: string; action: ApprovalAction; performed_by: string | null; note: string | null; created_at: string }
        Insert: { vendor_id: string; document_id: string; action: ApprovalAction; performed_by?: string | null; note?: string | null }
        Update: never
      }
      vendor_invites: {
        Row: { id: string; vendor_id: string; token: string; email: string; expires_at: string; accepted_at: string | null }
        Insert: { vendor_id: string; email: string; expires_at: string }
        Update: Partial<{ accepted_at: string }>
      }
    }
  }
}

// Convenience row types
export type Company = Database['public']['Tables']['companies']['Row']
export type AppUser = Database['public']['Tables']['users']['Row']
export type Vendor = Database['public']['Tables']['vendors']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectVendor = Database['public']['Tables']['project_vendors']['Row']
export type DocumentRequirement = Database['public']['Tables']['document_requirements']['Row']
export type VendorDocument = Database['public']['Tables']['vendor_documents']['Row']
export type ApprovalLog = Database['public']['Tables']['approval_log']['Row']
export type VendorInvite = Database['public']['Tables']['vendor_invites']['Row']

// Composite types used across pages
export type VendorWithLatestDocs = Vendor & {
  vendor_documents: (VendorDocument & { document_requirements: DocumentRequirement })[]
}
export type RequirementWithLatestDoc = DocumentRequirement & {
  latest_document: VendorDocument | null
}
