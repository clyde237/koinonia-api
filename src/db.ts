import { neon } from '@neondatabase/serverless';
import type { Config } from './config.js';

export function createDatabase(config: Config, direct = false) {
  const sql = neon(direct ? config.DIRECT_DATABASE_URL : config.DATABASE_URL, { fullResults: true, arrayMode: false });
  return {
    query: (text: string, parameters: unknown[] = []) => sql.query(text, parameters, { fetchOptions: { signal: AbortSignal.timeout(15000) } }),
    transaction: (statements: { text: string; parameters?: unknown[] }[]) => sql.transaction(statements.map(item => sql.query(item.text, item.parameters ?? [])), { fetchOptions: { signal: AbortSignal.timeout(15000) } }),
  };
}
export type Database = ReturnType<typeof createDatabase>;
