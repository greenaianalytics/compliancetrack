export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          name: string | null
          verified: boolean
          role: string
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          verified?: boolean
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          verified?: boolean
          role?: string
          created_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          nace_code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          nace_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          nace_code?: string | null
          created_at?: string
        }
      }
      tenant_users: {
        Row: {
          tenant_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          tenant_id: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          tenant_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      compliance_items: {
        Row: {
          id: string
          tenant_id: string | null
          title: string
          status: string
          year: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          title: string
          status?: string
          year?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          title?: string
          status?: string
          year?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      compliance_templates: {
        Row: {
          id: string
          nace_code: string
          title: string
          description: string | null
          category: string | null
          frequency: string
          template_data: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nace_code: string
          title: string
          description?: string | null
          category?: string | null
          frequency?: string
          template_data?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nace_code?: string
          title?: string
          description?: string | null
          category?: string | null
          frequency?: string
          template_data?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      compliance_task_instances: {
        Row: {
          id: string
          tenant_id: string
          template_id: string
          year: number
          title: string
          due_date: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          template_id: string
          year: number
          title: string
          due_date: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          template_id?: string
          year?: number
          title?: string
          due_date?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      custom_tasks: {
        Row: {
          id: string
          tenant_id: string
          created_by: string
          title: string
          description: string | null
          due_date: string
          is_recurring: boolean
          recurrence_pattern: string | null
          occurrence_year: number | null
          status: string
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          created_by: string
          title: string
          description?: string | null
          due_date: string
          is_recurring?: boolean
          recurrence_pattern?: string | null
          occurrence_year?: number | null
          status?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          created_by?: string
          title?: string
          description?: string | null
          due_date?: string
          is_recurring?: boolean
          recurrence_pattern?: string | null
          occurrence_year?: number | null
          status?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
