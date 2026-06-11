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
