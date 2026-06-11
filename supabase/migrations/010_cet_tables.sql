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
