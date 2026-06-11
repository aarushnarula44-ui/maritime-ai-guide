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
          is_premium: boolean
          onboarding_completed: boolean
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          state: string | null
          city: string | null
          category: 'general' | 'sc' | 'st' | 'obc_ncl' | 'ews' | null
          is_island_st_native: boolean
          deleted_at: string | null
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
          is_premium?: boolean
          onboarding_completed?: boolean
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          state?: string | null
          city?: string | null
          category?: 'general' | 'sc' | 'st' | 'obc_ncl' | 'ews' | null
          is_island_st_native?: boolean
          deleted_at?: string | null
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
          is_premium?: boolean
          onboarding_completed?: boolean
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          state?: string | null
          city?: string | null
          category?: 'general' | 'sc' | 'st' | 'obc_ncl' | 'ews' | null
          is_island_st_native?: boolean
          deleted_at?: string | null
          updated_at?: string
        }
      }
      academic_profiles: {
        Row: {
          id: string
          user_id: string
          qualification: 'class_10' | 'class_11' | 'class_12' | 'diploma' | 'engineering_grad' | 'bsc_grad' | 'other_grad' | null
          board_10: string | null
          board_12: string | null
          board: string | null
          year_of_passing: number | null
          year_of_passing_10: number | null
          year_of_passing_12: number | null
          physics_percentage: number | null
          chemistry_percentage: number | null
          maths_percentage: number | null
          pcm_percentage: number | null
          english_percentage_10: number | null
          english_percentage_12: number | null
          aggregate_percentage: number | null
          aggregate_percentage_10: number | null
          diploma_field: string | null
          diploma_percentage: number | null
          diploma_english_medium: boolean
          degree_field: string | null
          degree_percentage: number | null
          degree_university: string | null
          degree_english_medium: boolean
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
          board_10?: string | null
          board_12?: string | null
          board?: string | null
          year_of_passing?: number | null
          year_of_passing_10?: number | null
          year_of_passing_12?: number | null
          physics_percentage?: number | null
          chemistry_percentage?: number | null
          maths_percentage?: number | null
          pcm_percentage?: number | null
          english_percentage_10?: number | null
          english_percentage_12?: number | null
          aggregate_percentage?: number | null
          aggregate_percentage_10?: number | null
          diploma_field?: string | null
          diploma_percentage?: number | null
          diploma_english_medium?: boolean
          degree_field?: string | null
          degree_percentage?: number | null
          degree_university?: string | null
          degree_english_medium?: boolean
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          category?: 'general' | 'sc' | 'st' | 'obc_ncl' | 'ews' | null
          date_of_birth?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          qualification?: 'class_10' | 'class_11' | 'class_12' | 'diploma' | 'engineering_grad' | 'bsc_grad' | 'other_grad' | null
          board_10?: string | null
          board_12?: string | null
          board?: string | null
          year_of_passing?: number | null
          year_of_passing_10?: number | null
          year_of_passing_12?: number | null
          physics_percentage?: number | null
          chemistry_percentage?: number | null
          maths_percentage?: number | null
          pcm_percentage?: number | null
          english_percentage_10?: number | null
          english_percentage_12?: number | null
          aggregate_percentage?: number | null
          aggregate_percentage_10?: number | null
          diploma_field?: string | null
          diploma_percentage?: number | null
          diploma_english_medium?: boolean
          degree_field?: string | null
          degree_percentage?: number | null
          degree_university?: string | null
          degree_english_medium?: boolean
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
      college_courses: {
        Row: {
          id: string
          college_id: string
          course_id: string
          annual_fees: number | null
          seats: number | null
          admission_type: string | null
          application_deadline: string | null
        }
        Insert: {
          id?: string
          college_id: string
          course_id: string
          annual_fees?: number | null
          seats?: number | null
          admission_type?: string | null
          application_deadline?: string | null
        }
        Update: {
          annual_fees?: number | null
          seats?: number | null
          admission_type?: string | null
          application_deadline?: string | null
        }
      }
      user_saved_courses: {
        Row: {
          id: string
          user_id: string
          course_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          created_at?: string
        }
        Update: Record<string, never>
      }
      user_saved_colleges: {
        Row: {
          id: string
          user_id: string
          college_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          college_id: string
          created_at?: string
        }
        Update: Record<string, never>
      }
      college_reviews: {
        Row: {
          id: string
          college_id: string
          user_id: string
          rating_overall: number
          rating_teaching: number | null
          rating_placement: number | null
          rating_facilities: number | null
          review_text: string | null
          course_attended: string | null
          graduation_year: number | null
          is_verified: boolean
          is_helpful_count: number
          created_at: string
        }
        Insert: {
          id?: string
          college_id: string
          user_id: string
          rating_overall: number
          rating_teaching?: number | null
          rating_placement?: number | null
          rating_facilities?: number | null
          review_text?: string | null
          course_attended?: string | null
          graduation_year?: number | null
          is_verified?: boolean
          is_helpful_count?: number
          created_at?: string
        }
        Update: {
          rating_overall?: number
          review_text?: string | null
          is_verified?: boolean
          is_helpful_count?: number
        }
      }
      fraud_reports: {
        Row: {
          id: string
          college_id: string
          user_id: string
          report_type: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          college_id: string
          user_id: string
          report_type: string
          description?: string | null
          created_at?: string
        }
        Update: Record<string, never>
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
      eligibility_checks: {
        Row: {
          id: string
          user_id: string
          input_data: Json
          results: Json
          eligible_course_ids: string[]
          score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          input_data: Json
          results: Json
          eligible_course_ids?: string[]
          score?: number | null
          created_at?: string
        }
        Update: Record<string, never>
      }
      cet_schedules: {
        Row: {
          id: string
          year: number
          exam_date: string | null
          registration_start: string | null
          registration_end: string | null
          result_date: string | null
          status: 'upcoming' | 'registration_open' | 'ongoing' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          year: number
          exam_date?: string | null
          registration_start?: string | null
          registration_end?: string | null
          result_date?: string | null
          status?: 'upcoming' | 'registration_open' | 'ongoing' | 'completed'
          created_at?: string
        }
        Update: {
          status?: 'upcoming' | 'registration_open' | 'ongoing' | 'completed'
        }
      }
      user_cet_performance: {
        Row: {
          id: string
          user_id: string
          mathematics_avg: number | null
          physics_avg: number | null
          chemistry_avg: number | null
          english_avg: number | null
          aptitude_avg: number | null
          overall_avg: number | null
          tests_taken: number
          best_score: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mathematics_avg?: number | null
          physics_avg?: number | null
          chemistry_avg?: number | null
          english_avg?: number | null
          aptitude_avg?: number | null
          overall_avg?: number | null
          tests_taken?: number
          best_score?: number | null
          updated_at?: string
        }
        Update: {
          mathematics_avg?: number | null
          physics_avg?: number | null
          chemistry_avg?: number | null
          english_avg?: number | null
          aptitude_avg?: number | null
          overall_avg?: number | null
          tests_taken?: number
          best_score?: number | null
          updated_at?: string
        }
      }
      mock_test_attempts: {
        Row: {
          id: string
          user_id: string
          test_type: string
          score: number | null
          max_score: number | null
          time_taken_seconds: number | null
          subject_scores: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          test_type?: string
          score?: number | null
          max_score?: number | null
          time_taken_seconds?: number | null
          subject_scores?: Json | null
          created_at?: string
        }
        Update: Record<string, never>
      }
      leads: {
        Row: {
          id: string
          email: string | null
          phone: string | null
          source: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          phone?: string | null
          source?: string | null
          created_at?: string
        }
        Update: Record<string, never>
      }
      user_applications: {
        Row: {
          id: string
          user_id: string
          company_name: string
          program_name: string
          department: string | null
          applied_date: string | null
          status: 'applied' | 'written_test' | 'medical' | 'interview' | 'offered' | 'rejected'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          program_name: string
          department?: string | null
          applied_date?: string | null
          status?: 'applied' | 'written_test' | 'medical' | 'interview' | 'offered' | 'rejected'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'applied' | 'written_test' | 'medical' | 'interview' | 'offered' | 'rejected'
          notes?: string | null
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
