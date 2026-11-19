CREATE TABLE IF NOT EXISTS koinonia_profiles (
  -- Identifiant externe signé par Neon Auth, dont les tables restent gérées par Neon.
  user_id text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(data) = 'object'),
  onboarding_step smallint NOT NULL DEFAULT 0 CHECK (onboarding_step BETWEEN 0 AND 5),
  onboarding_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
