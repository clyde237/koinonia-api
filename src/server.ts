import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { createIdentityVerifier } from './identity.js';
import { readConfig } from './config.js';
import { createDatabase } from './db.js';
import { startDailyVerseScheduler } from './cron.js';

const config = readConfig();
const pool = createDatabase(config);
const app = createApp({ config, pool, verifyIdentity: createIdentityVerifier(config) });
const dailyVerseScheduler = startDailyVerseScheduler();
const server = serve({ fetch: app.fetch, hostname: config.HOST, port: config.PORT }, () => {
  console.log(`API Koinonia prête sur le port ${config.PORT}. Identité : Neon Auth.`);
});
const stop = () => {
  dailyVerseScheduler.stop();
  server.close(async () => { process.exit(0); });
};
process.once('SIGTERM', stop);
process.once('SIGINT', stop);
