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

-- knowledge_base: vector column only created if pgvector is available
CREATE TABLE public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_document TEXT,
  source_section TEXT,
  confidence_level confidence_type NOT NULL DEFAULT 'medium',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE public.knowledge_base ADD COLUMN embedding vector(1536);
  CREATE INDEX idx_knowledge_base_embedding ON public.knowledge_base USING hnsw (embedding vector_cosine_ops);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pgvector not available — embedding column skipped, will be added when pgvector is enabled';
END $$;

CREATE INDEX idx_knowledge_base_category ON public.knowledge_base(category, is_active);

ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active knowledge base" ON public.knowledge_base FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage knowledge base" ON public.knowledge_base FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
);

-- ai_response_cache: vector column optional
CREATE TABLE public.ai_response_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_hash TEXT NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  answer TEXT NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

DO $$ BEGIN
  ALTER TABLE public.ai_response_cache ADD COLUMN question_embedding vector(1536);
  CREATE INDEX idx_ai_response_cache_embedding ON public.ai_response_cache USING hnsw (question_embedding vector_cosine_ops);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pgvector not available — question_embedding column skipped';
END $$;

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
