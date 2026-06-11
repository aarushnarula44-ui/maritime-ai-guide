CREATE EXTENSION IF NOT EXISTS pgvector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE category_type AS ENUM ('general', 'sc', 'st', 'obc_ncl', 'ews');
CREATE TYPE qualification_type AS ENUM ('class_10', 'class_11', 'class_12', 'diploma', 'engineering_grad', 'bsc_grad', 'other_grad');
CREATE TYPE user_role_type AS ENUM ('student', 'admin', 'super_admin', 'college_partner', 'company_partner');
CREATE TYPE department_type AS ENUM ('deck', 'engine', 'eto', 'ratings', 'catering');
CREATE TYPE dgs_status_type AS ENUM ('approved', 'pending', 'suspended', 'not_listed', 'flagged');
CREATE TYPE college_type AS ENUM ('imu_campus', 'imu_affiliated', 'dgs_approved_private', 'unverified');
CREATE TYPE sponsorship_type AS ENUM ('full', 'partial', 'guaranteed_employment');
CREATE TYPE ai_intent_type AS ENUM ('factual_lookup', 'eligibility_query', 'conversational', 'out_of_scope');
CREATE TYPE session_type AS ENUM ('navai_chat', 'eligibility', 'roadmap');
CREATE TYPE event_category_type AS ENUM ('navigation', 'interaction', 'conversion', 'error', 'ai', 'search');
CREATE TYPE language_type AS ENUM ('en', 'hi');
CREATE TYPE priority_type AS ENUM ('fastest', 'highest_salary', 'lowest_cost', 'work_life_balance');
CREATE TYPE target_dept_type AS ENUM ('deck', 'engine', 'eto', 'ratings', 'undecided');
CREATE TYPE admission_type AS ENUM ('cet_only', 'own_exam', 'both', 'direct');
CREATE TYPE cet_status_type AS ENUM ('upcoming', 'registration_open', 'exam_completed', 'results_declared');
CREATE TYPE difficulty_type AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE subject_type AS ENUM ('mathematics', 'physics', 'chemistry', 'english', 'general_aptitude');
CREATE TYPE confidence_type AS ENUM ('high', 'medium', 'low', 'needs_verification');
CREATE TYPE fraud_type AS ENUM ('not_dgs_approved', 'fee_fraud', 'fake_placement', 'other');
CREATE TYPE report_status_type AS ENUM ('pending', 'investigating', 'verified', 'dismissed');
CREATE TYPE application_status_type AS ENUM ('applied', 'written_test', 'medical', 'interview', 'offered', 'rejected', 'withdrawn');
CREATE TYPE partner_tier_type AS ENUM ('basic', 'standard', 'premium');
CREATE TYPE company_type AS ENUM ('indian', 'international', 'ship_management', 'offshore');
CREATE TYPE digest_type AS ENUM ('daily', 'weekly', 'never');
CREATE TYPE notification_type AS ENUM ('cet_reminder', 'eligibility_update', 'sponsorship_open', 'system', 'fraud_alert');
CREATE TYPE announcement_type AS ENUM ('cet_update', 'new_circular', 'sponsorship_open', 'platform_update');
CREATE TYPE audience_type AS ENUM ('all', 'premium', 'deck_aspirants', 'engine_aspirants');
CREATE TYPE english_check_type AS ENUM ('class_10', 'class_12', 'either', 'degree', 'diploma_or_degree');
CREATE TYPE eligibility_qualification_type AS ENUM ('class_10', 'class_12_pcm', 'diploma', 'bsc', 'be_btech', 'other');
CREATE TYPE device_type AS ENUM ('mobile', 'tablet', 'desktop');
CREATE TYPE message_role_type AS ENUM ('user', 'assistant', 'system');
CREATE TYPE program_status_type AS ENUM ('open', 'closed', 'opening_soon');
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role_type NOT NULL DEFAULT 'student',
  language_preference language_type NOT NULL DEFAULT 'en',
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX idx_profiles_referred_by ON public.profiles(referred_by);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- Academic profiles
CREATE TABLE public.academic_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  qualification qualification_type,
  board TEXT,
  year_of_passing SMALLINT,
  pcm_percentage NUMERIC(5,2),
  english_percentage_10 NUMERIC(5,2),
  english_percentage_12 NUMERIC(5,2),
  aggregate_percentage NUMERIC(5,2),
  gender gender_type,
  category category_type,
  date_of_birth DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.academic_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own academic profile" ON public.academic_profiles
  FOR ALL USING (auth.uid() = user_id);

-- User preferences
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_department target_dept_type,
  priority priority_type,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  digest_frequency digest_type NOT NULL DEFAULT 'weekly',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, language_preference)
  VALUES (NEW.id, NEW.email, 'student', 'en')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.academic_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_academic_profiles
  BEFORE UPDATE ON public.academic_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_user_preferences
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT,
  department department_type NOT NULL,
  duration_months SMALLINT NOT NULL,
  duration_display TEXT NOT NULL,
  cet_required BOOLEAN NOT NULL DEFAULT false,
  display_max_age SMALLINT,
  salary_entry_min_usd INTEGER,
  salary_peak_max_usd INTEGER,
  salary_display TEXT,
  description TEXT,
  banner_color TEXT,
  source_circular TEXT,
  search_vector TSVECTOR,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_search ON public.courses USING GIN(search_vector);
CREATE INDEX idx_courses_department ON public.courses(department, is_active);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active courses" ON public.courses
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

-- Course eligibility rules
CREATE TABLE public.course_eligibility_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  route_number SMALLINT NOT NULL,
  route_label TEXT,
  qualification_required TEXT NOT NULL,
  min_pcm_percentage NUMERIC(5,2),
  min_aggregate_pct NUMERIC(5,2),
  min_english_percentage NUMERIC(5,2),
  english_check_level TEXT,
  max_age_general SMALLINT,
  min_age NUMERIC(4,1),
  additional_conditions JSONB,
  exemptions_granted JSONB,
  source_section TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_course_eligibility_rules_course ON public.course_eligibility_rules(course_id, is_active);

ALTER TABLE public.course_eligibility_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active eligibility rules" ON public.course_eligibility_rules
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage eligibility rules" ON public.course_eligibility_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

-- Course career progression
CREATE TABLE public.course_career_progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  rank_order SMALLINT NOT NULL,
  rank_title TEXT NOT NULL,
  years_from SMALLINT,
  years_to SMALLINT,
  salary_min_usd INTEGER,
  salary_max_usd INTEGER,
  coc_required TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_course_career_progression ON public.course_career_progression(course_id, rank_order);

ALTER TABLE public.course_career_progression ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view career progression" ON public.course_career_progression FOR SELECT USING (true);

-- STCW requirements
CREATE TABLE public.stcw_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  requirement_name TEXT NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.stcw_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view STCW requirements" ON public.stcw_requirements FOR SELECT USING (true);
CREATE TABLE public.colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type college_type NOT NULL,
  dgs_approval_status dgs_status_type NOT NULL DEFAULT 'pending',
  city TEXT,
  state TEXT,
  imu_affiliated BOOLEAN NOT NULL DEFAULT false,
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_partner BOOLEAN NOT NULL DEFAULT false,
  rating_avg NUMERIC(3,2),
  rating_count INTEGER NOT NULL DEFAULT 0,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_colleges_search ON public.colleges USING GIN(search_vector);
CREATE INDEX idx_colleges_state_status ON public.colleges(state, dgs_approval_status);
CREATE INDEX idx_colleges_active_partner ON public.colleges(is_active, is_partner);

ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active colleges" ON public.colleges FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage colleges" ON public.colleges FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
);

-- College courses
CREATE TABLE public.college_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  annual_fee_inr INTEGER,
  seats INTEGER,
  admission_type admission_type,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_college_courses_college ON public.college_courses(college_id, is_active);
CREATE INDEX idx_college_courses_course ON public.college_courses(course_id, is_active);

ALTER TABLE public.college_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view college courses" ON public.college_courses FOR SELECT USING (is_active = true);

-- College reviews
CREATE TABLE public.college_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(college_id, user_id)
);

ALTER TABLE public.college_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reviews" ON public.college_reviews FOR SELECT USING (true);
CREATE POLICY "Users can manage own reviews" ON public.college_reviews FOR ALL USING (auth.uid() = user_id);

-- Fraud reports
CREATE TABLE public.fraud_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  fraud_type fraud_type NOT NULL,
  description TEXT NOT NULL,
  status report_status_type NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.fraud_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can submit fraud reports" ON public.fraud_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can view fraud reports" ON public.fraud_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
);

CREATE TRIGGER set_updated_at_colleges
  BEFORE UPDATE ON public.colleges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TABLE public.shipping_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type company_type NOT NULL DEFAULT 'indian',
  website TEXT,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.shipping_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active companies" ON public.shipping_companies FOR SELECT USING (is_active = true);

CREATE TABLE public.sponsorship_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.shipping_companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type sponsorship_type NOT NULL,
  status program_status_type NOT NULL DEFAULT 'open',
  seats_available INTEGER,
  bond_years SMALLINT,
  stipend_inr INTEGER,
  description TEXT,
  application_url TEXT,
  deadline DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sponsorship_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view sponsorship programs" ON public.sponsorship_programs FOR SELECT USING (true);

CREATE TABLE public.sponsorship_course_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsorship_id UUID NOT NULL REFERENCES public.sponsorship_programs(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  UNIQUE(sponsorship_id, course_id)
);

CREATE INDEX idx_sponsorship_course_sponsorship ON public.sponsorship_course_eligibility(sponsorship_id);
CREATE INDEX idx_sponsorship_course_course ON public.sponsorship_course_eligibility(course_id);

ALTER TABLE public.sponsorship_course_eligibility ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view sponsorship course eligibility" ON public.sponsorship_course_eligibility FOR SELECT USING (true);

CREATE TABLE public.sponsorship_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.sponsorship_programs(id) ON DELETE CASCADE,
  status application_status_type NOT NULL DEFAULT 'applied',
  notes TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, program_id)
);

ALTER TABLE public.sponsorship_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own applications" ON public.sponsorship_applications FOR ALL USING (auth.uid() = user_id);
CREATE TABLE public.ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_type session_type NOT NULL DEFAULT 'navai_chat',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ai_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sessions" ON public.ai_sessions FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.ai_sessions(id) ON DELETE CASCADE,
  role message_role_type NOT NULL,
  content TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_session ON public.ai_messages(session_id, created_at);

ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON public.ai_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ai_sessions WHERE id = session_id AND (user_id = auth.uid() OR user_id IS NULL))
);
CREATE POLICY "Users can insert messages" ON public.ai_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.ai_sessions WHERE id = session_id AND (user_id = auth.uid() OR user_id IS NULL))
);

CREATE TABLE public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  source_document TEXT,
  source_section TEXT,
  confidence_level confidence_type NOT NULL DEFAULT 'medium',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_knowledge_base_embedding ON public.knowledge_base USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_knowledge_base_category ON public.knowledge_base(category, is_active);

ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active knowledge base" ON public.knowledge_base FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage knowledge base" ON public.knowledge_base FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
);

CREATE TABLE public.ai_response_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_hash TEXT NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  question_embedding vector(1536),
  answer TEXT NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_ai_response_cache_embedding ON public.ai_response_cache USING hnsw (question_embedding vector_cosine_ops);

ALTER TABLE public.ai_response_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cache" ON public.ai_response_cache FOR SELECT USING (true);
CREATE POLICY "Service role can manage cache" ON public.ai_response_cache FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE public.ai_knowledge_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  frequency INTEGER NOT NULL DEFAULT 1,
  last_asked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ai_knowledge_gaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view knowledge gaps" ON public.ai_knowledge_gaps FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
);
CREATE POLICY "Service role can manage knowledge gaps" ON public.ai_knowledge_gaps FOR ALL USING (auth.role() = 'service_role');
CREATE TABLE public.cet_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year TEXT NOT NULL,
  registration_opens DATE,
  registration_closes DATE,
  exam_date DATE,
  results_date DATE,
  status cet_status_type NOT NULL DEFAULT 'upcoming',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.cet_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view CET schedules" ON public.cet_schedules FOR SELECT USING (true);

CREATE TABLE public.cet_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject subject_type NOT NULL,
  topic_name TEXT NOT NULL,
  subtopic_name TEXT,
  weightage_pct NUMERIC(5,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(subject, topic_name, subtopic_name)
);

ALTER TABLE public.cet_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view CET topics" ON public.cet_topics FOR SELECT USING (is_active = true);

CREATE TABLE public.cet_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.cet_topics(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('a','b','c','d')),
  explanation TEXT,
  difficulty difficulty_type NOT NULL DEFAULT 'medium',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cet_questions_topic ON public.cet_questions(topic_id, difficulty, is_active);

ALTER TABLE public.cet_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active CET questions" ON public.cet_questions FOR SELECT USING (is_active = true);

CREATE TABLE public.mock_test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject subject_type,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER,
  answers JSONB,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mock_test_attempts_user ON public.mock_test_attempts(user_id, completed_at);

ALTER TABLE public.mock_test_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own test attempts" ON public.mock_test_attempts FOR ALL USING (auth.uid() = user_id);

CREATE TABLE public.user_cet_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mathematics_avg NUMERIC(5,2),
  physics_avg NUMERIC(5,2),
  chemistry_avg NUMERIC(5,2),
  english_avg NUMERIC(5,2),
  aptitude_avg NUMERIC(5,2),
  overall_avg NUMERIC(5,2),
  tests_completed INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_cet_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own CET performance" ON public.user_cet_performance FOR ALL USING (auth.uid() = user_id);
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  category event_category_type NOT NULL DEFAULT 'interaction',
  properties JSONB,
  device device_type,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create initial partitions
CREATE TABLE public.analytics_events_2025_06 PARTITION OF public.analytics_events
  FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
CREATE TABLE public.analytics_events_2025_07 PARTITION OF public.analytics_events
  FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');
CREATE TABLE public.analytics_events_2025_08 PARTITION OF public.analytics_events
  FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
CREATE TABLE public.analytics_events_2025_09 PARTITION OF public.analytics_events
  FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE public.analytics_events_2025_10 PARTITION OF public.analytics_events
  FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE public.analytics_events_2025_11 PARTITION OF public.analytics_events
  FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE public.analytics_events_2025_12 PARTITION OF public.analytics_events
  FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
CREATE TABLE public.analytics_events_2026_01 PARTITION OF public.analytics_events
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE public.analytics_events_2026_02 PARTITION OF public.analytics_events
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE public.analytics_events_2026_03 PARTITION OF public.analytics_events
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE public.analytics_events_default PARTITION OF public.analytics_events DEFAULT;

CREATE INDEX idx_analytics_events_name ON public.analytics_events(event_name, created_at);
CREATE INDEX idx_analytics_events_user ON public.analytics_events(user_id, created_at);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage analytics" ON public.analytics_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admins can view analytics" ON public.analytics_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
);

-- Daily stats
CREATE TABLE public.daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  new_signups INTEGER NOT NULL DEFAULT 0,
  eligibility_checks INTEGER NOT NULL DEFAULT 0,
  ai_messages INTEGER NOT NULL DEFAULT 0,
  page_views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view daily stats" ON public.daily_stats FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type announcement_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience audience_type NOT NULL DEFAULT 'all',
  is_active BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active announcements" ON public.announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
);

-- Admin audit log
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_log ON public.admin_audit_log(admin_id, created_at);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit log" ON public.admin_audit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
);

-- Eligibility checks
CREATE TABLE public.eligibility_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  input_data JSONB NOT NULL,
  eligible_courses JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.eligibility_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own eligibility checks" ON public.eligibility_checks FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Anyone can insert eligibility checks" ON public.eligibility_checks FOR INSERT WITH CHECK (true);

-- Saved courses & colleges
CREATE TABLE public.user_saved_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.user_saved_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own saved courses" ON public.user_saved_courses FOR ALL USING (auth.uid() = user_id);

CREATE TABLE public.user_saved_colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, college_id)
);

ALTER TABLE public.user_saved_colleges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own saved colleges" ON public.user_saved_colleges FOR ALL USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.recalculate_college_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_college_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_college_id := OLD.college_id;
  ELSE
    v_college_id := NEW.college_id;
  END IF;

  UPDATE public.colleges
  SET
    rating_avg = (SELECT AVG(rating)::NUMERIC(3,2) FROM public.college_reviews WHERE college_id = v_college_id),
    rating_count = (SELECT COUNT(*) FROM public.college_reviews WHERE college_id = v_college_id),
    updated_at = NOW()
  WHERE id = v_college_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_college_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.college_reviews
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_college_rating();
