// ── Generated Supabase types ──────────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      approval_log: {
        Row: {
          action: string
          created_at: string | null
          document_id: string
          id: string
          note: string | null
          performed_by: string | null
          vendor_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          document_id: string
          id?: string
          note?: string | null
          performed_by?: string | null
          vendor_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          document_id?: string
          id?: string
          note?: string | null
          performed_by?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "vendor_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_log_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      document_requirements: {
        Row: {
          company_id: string
          description: string | null
          id: string
          is_required: boolean
          name: string
          owner_role: string
          requires_expiration: boolean
        }
        Insert: {
          company_id: string
          description?: string | null
          id?: string
          is_required?: boolean
          name: string
          owner_role: string
          requires_expiration?: boolean
        }
        Update: {
          company_id?: string
          description?: string | null
          id?: string
          is_required?: boolean
          name?: string
          owner_role?: string
          requires_expiration?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "document_requirements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      project_vendors: {
        Row: {
          assigned_at: string | null
          id: string
          project_id: string
          vendor_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          project_id: string
          vendor_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          project_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_vendors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_vendors_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          company_id: string
          id: string
          name: string
          start_date: string | null
          status: string
        }
        Insert: {
          address?: string | null
          company_id: string
          id?: string
          name: string
          start_date?: string | null
          status?: string
        }
        Update: {
          address?: string | null
          company_id?: string
          id?: string
          name?: string
          start_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          company_id: string
          created_at: string | null
          email: string
          full_name: string
          id: string
          role: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          email: string
          full_name: string
          id: string
          role: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_documents: {
        Row: {
          expiration_date: string | null
          file_name: string
          file_url: string
          id: string
          rejection_reason: string | null
          requirement_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          uploaded_at: string | null
          vendor_id: string
        }
        Insert: {
          expiration_date?: string | null
          file_name: string
          file_url: string
          id?: string
          rejection_reason?: string | null
          requirement_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          uploaded_at?: string | null
          vendor_id: string
        }
        Update: {
          expiration_date?: string | null
          file_name?: string
          file_url?: string
          id?: string
          rejection_reason?: string | null
          requirement_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          uploaded_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_documents_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "document_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_documents_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_invites: {
        Row: {
          accepted_at: string | null
          email: string
          expires_at: string
          id: string
          token: string
          vendor_id: string
        }
        Insert: {
          accepted_at?: string | null
          email: string
          expires_at: string
          id?: string
          token?: string
          vendor_id: string
        }
        Update: {
          accepted_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          token?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_invites_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          auth_user_id: string | null
          company_id: string
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          status: string
          trade_type: string | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          company_id: string
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          status?: string
          trade_type?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          company_id?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          status?: string
          trade_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_company_id: { Args: never; Returns: string }
      auth_user_role: { Args: never; Returns: string }
      compute_vendor_status: { Args: { p_vendor_id: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ── App-level string union types ──────────────────────────────────────────────

export type VendorStatus = 'incomplete' | 'pending' | 'blocked' | 'expiring_soon' | 'approved'
export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'expired'
export type UserRole = 'admin' | 'compliance' | 'pm' | 'accounting' | 'field'
export type OwnerRole = 'compliance' | 'accounting' | 'pm' | 'safety'
export type ProjectStatus = 'active' | 'completed' | 'archived'
export type ApprovalAction = 'uploaded' | 'approved' | 'rejected' | 'revision_requested' | 'expired'

// ── Convenience row types ─────────────────────────────────────────────────────

export type Company = Database['public']['Tables']['companies']['Row']
export type AppUser = Database['public']['Tables']['users']['Row']
export type Vendor = Database['public']['Tables']['vendors']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectVendor = Database['public']['Tables']['project_vendors']['Row']
export type DocumentRequirement = Database['public']['Tables']['document_requirements']['Row']
export type VendorDocument = Database['public']['Tables']['vendor_documents']['Row']
export type ApprovalLog = Database['public']['Tables']['approval_log']['Row']
export type VendorInvite = Database['public']['Tables']['vendor_invites']['Row']

// ── Composite types used across pages ─────────────────────────────────────────

export type VendorWithLatestDocs = Vendor & {
  vendor_documents: (VendorDocument & { document_requirements: DocumentRequirement })[]
}
export type RequirementWithLatestDoc = DocumentRequirement & {
  latest_document: VendorDocument | null
}
