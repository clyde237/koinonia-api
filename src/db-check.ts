import { readConfig } from './config.js';
import { createDatabase } from './db.js';
const config = readConfig();
const pool = createDatabase(config, true);
try {
  const result = await pool.query('SELECT current_database() AS name');
  const tables = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
  console.log('Connexion réussie. Base :', result.rows[0].name);
  console.log('Tables :', tables.rows.map(row => row.tablename).join(', ') || '(aucune)');
} catch (error) {
  console.error('Connexion PostgreSQL indisponible.', error instanceof Error ? error.name : 'Erreur'); process.exitCode = 1;
}
