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
