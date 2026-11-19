import 'dotenv/config';
import { resolve } from 'node:path';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'), PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  API_URL: z.url(), NEON_AUTH_URL: z.url(), NEON_AUTH_JWKS_URL: z.url(),
  DATABASE_URL: z.string().startsWith('postgresql://'), DIRECT_DATABASE_URL: z.string().startsWith('postgresql://'),
  TRUSTED_ORIGINS: z.string().default('http://localhost:8081'),
  DATA_DIR: z.string().default('.data'),
});

export function readConfig(env: NodeJS.ProcessEnv = process.env) {
  const result = schema.safeParse(env);
  // Ne jamais imprimer l'environnement ou les valeurs des secrets lors d'une erreur.
  if (!result.success) throw new Error(`Configuration invalide : ${result.error.issues.map(issue => issue.path.join('.')).join(', ')}`);
  const values = result.data;
  if (!values.NEON_AUTH_URL.startsWith('https://') || !values.NEON_AUTH_JWKS_URL.startsWith('https://')) throw new Error('Neon Auth doit utiliser HTTPS.');
  if (values.NODE_ENV === 'production' && !values.API_URL.startsWith('https://')) throw new Error('L’API doit utiliser HTTPS en production.');
  return { ...values, API_URL: values.API_URL.replace(/\/$/, ''), DATA_DIR: resolve(values.DATA_DIR), origins: values.TRUSTED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean) };
}
export type Config = ReturnType<typeof readConfig>;
