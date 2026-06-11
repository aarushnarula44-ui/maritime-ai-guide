export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: 'student' | 'admin' | 'super_admin' | 'college_partner' | 'company_partner'
          language_preference: 'en' | 'hi'
          referral_code: string | null
          referred_by: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'student' | 'admin' | 'super_admin' | 'college_partner' | 'company_partner'
          language_preference?: 'en' | 'hi'
          referral_code?: string | null
          referred_by?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'student' | 'admin' | 'super_admin' | 'college_partner' | 'company_partner'
          language_preference?: 'en' | 'hi'
          referral_code?: string | null
          referred_by?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      academic_profiles: {
        Row: {
          id: string
          user_id: string
          qualification: 'class_10' | 'class_11' | 'class_12' | 'diploma' | 'engineering_grad' | 'bsc_grad' | 'other_grad' | null
          board: string | null
          year_of_passing: number | null
          pcm_percentage: number | null
          english_percentage_10: number | null
          english_percentage_12: number | null
          aggregate_percentage: number | null
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          category: 'general' | 'sc' | 'st' | 'obc_ncl' | 'ews' | null
          date_of_birth: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          qualification?: 'class_10' | 'class_11' | 'class_12' | 'diploma' | 'engineering_grad' | 'bsc_grad' | 'other_grad' | null
          board?: string | null
          year_of_passing?: number | null
          pcm_percentage?: number | null
          english_percentage_10?: number | null
          english_percentage_12?: number | null
          aggregate_percentage?: number | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          category?: 'general' | 'sc' | 'st' | 'obc_ncl' | 'ews' | null
          date_of_birth?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          qualification?: 'class_10' | 'class_11' | 'class_12' | 'diploma' | 'engineering_grad' | 'bsc_grad' | 'other_grad' | null
          board?: string | null
          year_of_passing?: number | null
          pcm_percentage?: number | null
          english_percentage_10?: number | null
          english_percentage_12?: number | null
          aggregate_percentage?: number | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          category?: 'general' | 'sc' | 'st' | 'obc_ncl' | 'ews' | null
          date_of_birth?: string | null
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          target_department: 'deck' | 'engine' | 'eto' | 'ratings' | 'undecided' | null
          priority: 'fastest' | 'highest_salary' | 'lowest_cost' | 'work_life_balance' | null
          email_notifications: boolean
          digest_frequency: 'daily' | 'weekly' | 'never'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_department?: 'deck' | 'engine' | 'eto' | 'ratings' | 'undecided' | null
          priority?: 'fastest' | 'highest_salary' | 'lowest_cost' | 'work_life_balance' | null
          email_notifications?: boolean
          digest_frequency?: 'daily' | 'weekly' | 'never'
          created_at?: string
          updated_at?: string
        }
        Update: {
          target_department?: 'deck' | 'engine' | 'eto' | 'ratings' | 'undecided' | null
          priority?: 'fastest' | 'highest_salary' | 'lowest_cost' | 'work_life_balance' | null
          email_notifications?: boolean
          digest_frequency?: 'daily' | 'weekly' | 'never'
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          slug: string
          name: string
          short_name: string | null
          department: 'deck' | 'engine' | 'eto' | 'ratings' | 'catering'
          duration_months: number
          duration_display: string
          cet_required: boolean
          display_max_age: number | null
          salary_entry_min_usd: number | null
          salary_peak_max_usd: number | null
          salary_display: string | null
          description: string | null
          banner_color: string | null
          source_circular: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          short_name?: string | null
          department: 'deck' | 'engine' | 'eto' | 'ratings' | 'catering'
          duration_months: number
          duration_display: string
          cet_required?: boolean
          display_max_age?: number | null
          salary_entry_min_usd?: number | null
          salary_peak_max_usd?: number | null
          salary_display?: string | null
          description?: string | null
          banner_color?: string | null
          source_circular?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          name?: string
          short_name?: string | null
          department?: 'deck' | 'engine' | 'eto' | 'ratings' | 'catering'
          duration_months?: number
          duration_display?: string
          cet_required?: boolean
          display_max_age?: number | null
          salary_entry_min_usd?: number | null
          salary_peak_max_usd?: number | null
          salary_display?: string | null
          description?: string | null
          banner_color?: string | null
          source_circular?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      course_eligibility_rules: {
        Row: {
          id: string
          course_id: string
          route_number: number
          route_label: string | null
          qualification_required: string
          min_pcm_percentage: number | null
          min_aggregate_pct: number | null
          min_english_percentage: number | null
          english_check_level: string | null
          max_age_general: number | null
          min_age: number | null
          additional_conditions: Json | null
          exemptions_granted: Json | null
          source_section: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          route_number: number
          route_label?: string | null
          qualification_required: string
          min_pcm_percentage?: number | null
          min_aggregate_pct?: number | null
          min_english_percentage?: number | null
          english_check_level?: string | null
          max_age_general?: number | null
          min_age?: number | null
          additional_conditions?: Json | null
          exemptions_granted?: Json | null
          source_section?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          route_number?: number
          route_label?: string | null
          qualification_required?: string
          min_pcm_percentage?: number | null
          min_aggregate_pct?: number | null
          min_english_percentage?: number | null
          english_check_level?: string | null
          max_age_general?: number | null
          min_age?: number | null
          additional_conditions?: Json | null
          exemptions_granted?: Json | null
          source_section?: string | null
          is_active?: boolean
        }
      }
      colleges: {
        Row: {
          id: string
          slug: string
          name: string
          type: 'imu_campus' | 'imu_affiliated' | 'dgs_approved_private' | 'unverified'
          dgs_approval_status: 'approved' | 'pending' | 'suspended' | 'not_listed' | 'flagged'
          city: string | null
          state: string | null
          imu_affiliated: boolean
          is_active: boolean
          is_partner: boolean
          rating_avg: number | null
          rating_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          type: 'imu_campus' | 'imu_affiliated' | 'dgs_approved_private' | 'unverified'
          dgs_approval_status?: 'approved' | 'pending' | 'suspended' | 'not_listed' | 'flagged'
          city?: string | null
          state?: string | null
          imu_affiliated?: boolean
          is_active?: boolean
          is_partner?: boolean
          rating_avg?: number | null
          rating_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          name?: string
          type?: 'imu_campus' | 'imu_affiliated' | 'dgs_approved_private' | 'unverified'
          dgs_approval_status?: 'approved' | 'pending' | 'suspended' | 'not_listed' | 'flagged'
          city?: string | null
          state?: string | null
          imu_affiliated?: boolean
          is_active?: boolean
          is_partner?: boolean
          rating_avg?: number | null
          rating_count?: number
          updated_at?: string
        }
      }
      ai_sessions: {
        Row: {
          id: string
          user_id: string | null
          session_type: 'navai_chat' | 'eligibility' | 'roadmap'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_type?: 'navai_chat' | 'eligibility' | 'roadmap'
          created_at?: string
          updated_at?: string
        }
        Update: {
          session_type?: 'navai_chat' | 'eligibility' | 'roadmap'
          updated_at?: string
        }
      }
      ai_messages: {
        Row: {
          id: string
          session_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at?: string
        }
        Update: {
          content?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'cet_reminder' | 'eligibility_update' | 'sponsorship_open' | 'system' | 'fraud_alert'
          title: string
          body: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'cet_reminder' | 'eligibility_update' | 'sponsorship_open' | 'system' | 'fraud_alert'
          title: string
          body?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
