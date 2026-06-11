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
