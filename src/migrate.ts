import { readFile } from 'node:fs/promises';
import { readConfig } from './config.js';
import { createDatabase } from './db.js';

const config = readConfig();
const pool = createDatabase(config, true);
try {
  const sql = await readFile(new URL('../migrations/001_profiles.sql', import.meta.url), 'utf8');
  await pool.transaction([
    { text: 'SELECT pg_advisory_xact_lock(827364112)' },
    { text: 'CREATE TABLE IF NOT EXISTS koinonia_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())' },
    { text: sql },
    { text: 'INSERT INTO koinonia_migrations (name) VALUES ($1) ON CONFLICT DO NOTHING', parameters: ['001_profiles'] },
  ]);
  console.log('Schéma du profil Koinonia prêt. L’identité est gérée par Neon Auth.');
} catch {
  console.error('Migration impossible. Vérifiez la connexion et les droits de la branche de développement.'); process.exitCode = 1;
}
