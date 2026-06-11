CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  phone TEXT,
  eligibility_score INTEGER,
  eligible_course_ids TEXT[],
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT leads_contact_check CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Only service role can read leads (admin only)
CREATE POLICY "leads_insert_anon" ON leads FOR INSERT TO anon, authenticated WITH CHECK (true);
