import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { bodyLimit } from 'hono/body-limit';
import { secureHeaders } from 'hono/secure-headers';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import type { Database } from './db.js';
import type { Config } from './config.js';
import type { createIdentityVerifier } from './identity.js';
import { getProfile, profileSchema, saveProfile } from './profile.js';
import { getBibleBooks, getBibleChapter, searchBible, getDailyVerse } from './bible.js';
import {
  getAllBreakfasts,
  getTodayBreakfast,
  getBreakfastById,
  generateBreakfastPdfBuffer,
  generateSampleAudioBuffer,
  generateSampleVideoBuffer,
} from './breakfasts.js';

type Context = { Variables: { userId: string } };
type Services = { config: Config; pool: Database; verifyIdentity: ReturnType<typeof createIdentityVerifier> };

export function createApp({ config, pool, verifyIdentity }: Services) {
  const app = new Hono<Context>();
  app.use('*', secureHeaders());
  app.use('/api/*', cors({
    origin: origin => config.origins.includes(origin) ? origin : '', credentials: true,
    allowHeaders: ['Content-Type', 'X-Koinonia-Client', 'Authorization'], allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }));
  app.use('/api/*', bodyLimit({ maxSize: 3 * 1024 * 1024, onError: c => c.json({ error: 'Le fichier est trop volumineux.' }, 413) }));
  app.get('/health', c => c.json({ status: 'ok' }));

  // Routes publiques Bible (Louis Segond 1910)
  app.get('/api/bible/books', c => {
    return c.json(getBibleBooks());
  });

  app.get('/api/bible/chapters/:bookId/:chapter', c => {
    const bookId = c.req.param('bookId').toLowerCase();
    const chapter = parseInt(c.req.param('chapter'), 10);
    if (isNaN(chapter)) return c.json({ error: 'Numéro de chapitre invalide.' }, 400);
    const data = getBibleChapter(bookId, chapter);
    if (!data) return c.json({ error: 'Chapitre ou livre introuvable.' }, 404);
    return c.json(data);
  });

  app.get('/api/bible/search', c => {
    const q = c.req.query('q') || '';
    const testament = c.req.query('testament') as 'AT' | 'NT' | undefined;
    const bookId = c.req.query('bookId');
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!, 10) : 20;
    const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!, 10) : 0;
    return c.json(searchBible(q, { testament, bookId, limit, offset }));
  });

  app.get('/api/bible/daily', c => {
    const date = c.req.query('date');
    return c.json(getDailyVerse(date));
  });

  // Routes publiques Méditations & Breakfasts
  app.get('/api/breakfasts', c => {
    return c.json(getAllBreakfasts(config.API_URL));
  });

  app.get('/api/breakfasts/today', c => {
    return c.json(getTodayBreakfast(config.API_URL));
  });

  app.get('/api/breakfasts/:id', c => {
    const id = c.req.param('id');
    const item = getBreakfastById(id, config.API_URL);
    if (!item) return c.json({ error: 'Breakfast introuvable.' }, 404);
    return c.json(item);
  });

  app.get('/api/breakfasts/:id/download/:type', c => {
    const id = c.req.param('id');
    const type = c.req.param('type');
    const item = getBreakfastById(id, config.API_URL);
    if (!item) return c.json({ error: 'Breakfast introuvable.' }, 404);

    if (type === 'pdf') {
      const pdf = generateBreakfastPdfBuffer(item);
      c.header('Content-Type', 'application/pdf');
      c.header('Content-Disposition', `attachment; filename="koinonia-breakfast-${item.id}.pdf"`);
      return c.body(new Uint8Array(pdf));
    }

    if (type === 'audio') {
      const audio = generateSampleAudioBuffer(item);
      c.header('Content-Type', 'audio/mpeg');
      c.header('Content-Disposition', `attachment; filename="koinonia-breakfast-${item.id}.mp3"`);
      return c.body(new Uint8Array(audio));
    }

    if (type === 'video') {
      const video = generateSampleVideoBuffer(item);
      c.header('Content-Type', 'video/mp4');
      c.header('Content-Disposition', `attachment; filename="koinonia-breakfast-${item.id}.mp4"`);
      return c.body(new Uint8Array(video));
    }

    return c.json({ error: 'Type de média non supporté. Valeurs acceptées : pdf, audio, video.' }, 400);
  });

  app.use('/api/me/*', async (c, next) => {
    c.header('Cache-Control', 'no-store');
    const header = c.req.header('Authorization');
    const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return c.json({ error: 'Votre session a expiré. Reconnectez-vous.' }, 401);
    try { c.set('userId', await verifyIdentity(token)); }
    catch { return c.json({ error: 'Votre session a expiré. Reconnectez-vous.' }, 401); }
    if (!['GET', 'HEAD', 'OPTIONS'].includes(c.req.method)) {
      // Les clients web étrangers doivent passer une prérequête CORS avant d'écrire.
      if (c.req.header('X-Koinonia-Client') !== 'mobile') return c.json({ error: 'Requête non autorisée.' }, 403);
      const origin = c.req.header('Origin');
      if (origin && !config.origins.includes(origin)) return c.json({ error: 'Origine non autorisée.' }, 403);
    }
    await next();
  });
  app.get('/api/me/profile', async c => c.json(await getProfile(pool, c.get('userId'), config.API_URL)));
  app.put('/api/me/profile', async c => {
    if (!c.req.header('Content-Type')?.startsWith('application/json')) return c.json({ error: 'Format de requête invalide.' }, 415);
    const parsed = profileSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'Vérifiez les informations du profil.', fields: parsed.error.issues.map(issue => issue.path.join('.')) }, 400);
    await saveProfile(pool, c.get('userId'), parsed.data);
    return c.json(await getProfile(pool, c.get('userId'), config.API_URL));
  });
  app.post('/api/me/avatar', async c => {
    const body = await c.req.parseBody();
    const file = body.photo;
    if (!(file instanceof File) || !file.size || file.size > 2 * 1024 * 1024) return c.json({ error: 'Choisissez une photo de moins de 2 Mo.' }, 400);
    const data = Buffer.from(await file.arrayBuffer());
    const extension = data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff ? 'jpg'
      : data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? 'png'
      : data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP' ? 'webp' : null;
    if (!extension) return c.json({ error: 'Utilisez une photo JPEG, PNG ou WebP.' }, 400);
    const directory = join(config.DATA_DIR, 'avatars');
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const key = `${randomUUID()}.${extension}`;
    const userId = c.get('userId');
    try {
      await writeFile(join(directory, key), data, { mode: 0o600, flag: 'wx' });
      const old = await pool.query('SELECT data->>\'avatarKey\' AS key FROM koinonia_profiles WHERE user_id=$1', [userId]);
      await pool.query(`INSERT INTO koinonia_profiles (user_id, data) VALUES ($1, jsonb_build_object('avatarKey', $2::text))
        ON CONFLICT (user_id) DO UPDATE SET data = koinonia_profiles.data || EXCLUDED.data, updated_at = now()`, [userId, key]);
      if (old.rows[0]?.key && /^[a-f0-9-]+\.(jpg|png|webp)$/.test(old.rows[0].key)) await unlink(join(directory, old.rows[0].key)).catch(() => {});
    } catch (error) { await unlink(join(directory, key)).catch(() => {}); throw error; }
    return c.json(await getProfile(pool, userId, config.API_URL));
  });
  app.get('/api/me/avatar', async c => {
    const result = await pool.query('SELECT data->>\'avatarKey\' AS key FROM koinonia_profiles WHERE user_id=$1', [c.get('userId')]);
    const key: string | undefined = result.rows[0]?.key;
    if (!key || !/^[a-f0-9-]+\.(jpg|png|webp)$/.test(key)) return c.notFound();
    const data = await readFile(join(config.DATA_DIR, 'avatars', key)).catch(() => null);
    if (!data) return c.notFound();
    c.header('Content-Type', key.endsWith('.jpg') ? 'image/jpeg' : key.endsWith('.png') ? 'image/png' : 'image/webp');
    return c.body(new Uint8Array(data));
  });
  app.delete('/api/me/avatar', async c => {
    const result = await pool.query(`WITH previous AS (
      SELECT data->>'avatarKey' AS key FROM koinonia_profiles WHERE user_id=$1 FOR UPDATE
    ), updated AS (
      UPDATE koinonia_profiles SET data = data - 'avatarKey', updated_at = now() WHERE user_id=$1 RETURNING user_id
    ) SELECT previous.key FROM previous, updated`, [c.get('userId')]);
    const key = result.rows[0]?.key;
    if (key && /^[a-f0-9-]+\.(jpg|png|webp)$/.test(key)) await unlink(join(config.DATA_DIR, 'avatars', key)).catch(() => {});
    return c.json({ removed: Boolean(result.rowCount) });
  });
  app.onError((error, c) => {
    const code = 'code' in error && typeof error.code === 'string' && /^[A-Z0-9_]{1,40}$/.test(error.code) ? error.code : 'INTERNAL_ERROR';
    console.error('Une requête de l’API a échoué.', code);
    return c.json({ error: 'Le service est temporairement indisponible. Réessayez.' }, 500);
  });
  return app;
}
