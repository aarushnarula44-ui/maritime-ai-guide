-- pgvector requires Supabase Pro plan — skip if unavailable
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS pgvector;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pgvector not available on this plan, skipping';
END $$;

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_stat_statements not available, skipping';
END $$;
