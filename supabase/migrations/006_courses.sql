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
