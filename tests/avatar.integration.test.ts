import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readConfig } from '../src/config.js';
import { createDatabase } from '../src/db.js';
import { createIdentityVerifier } from '../src/identity.js';
import { createApp } from '../src/app.js';

test('photo privée : importer, relire et supprimer sans conserver de données de test', { skip: process.env.RUN_DATABASE_TESTS !== '1', timeout: 120000 }, async () => {
  const config = readConfig();
  const fixture = JSON.parse(await readFile(join(config.DATA_DIR, 'integration-user.json'), 'utf8'));
  const cookies = new Map<string, string>();
  const auth = async (path: string, body?: unknown) => {
    const response = await fetch(`${config.NEON_AUTH_URL}${path}`, { method: body === undefined ? 'GET' : 'POST', signal: AbortSignal.timeout(20000), headers: { Origin: 'http://localhost:3000', 'Content-Type': 'application/json', Cookie: [...cookies].map(([key, value]) => `${key}=${value}`).join('; ') }, body: body === undefined ? undefined : JSON.stringify(body) });
    for (const cookie of response.headers.getSetCookie()) { const pair = cookie.split(';')[0]; const i = pair.indexOf('='); cookies.set(pair.slice(0, i), pair.slice(i + 1)); }
    assert.equal(response.status, 200);
    const text = await response.text(); return text ? JSON.parse(text) : null;
  };
  const db = createDatabase(config);
  const app = createApp({ config, pool: db, verifyIdentity: createIdentityVerifier(config) });
  await auth('/sign-in/email', { email: fixture.email, password: fixture.password });
  const { token } = await auth('/token');
  const headers = { Authorization: `Bearer ${token}`, 'X-Koinonia-Client': 'mobile' };
  try {
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9QAAAABJRU5ErkJggg==', 'base64');
    const form = new FormData(); form.set('photo', new File([png], 'avatar.png', { type: 'image/png' }));
    const uploaded = await app.request('/api/me/avatar', { method: 'POST', headers, body: form }); assert.equal(uploaded.status, 200);
    const profile = await uploaded.json(); assert.match(profile.photo, /^\/api\/me\/avatar\?v=/);
    assert.equal((await app.request('/api/me/avatar')).status, 401);
    const image = await app.request('/api/me/avatar', { headers }); assert.equal(image.status, 200); assert.equal(image.headers.get('Content-Type'), 'image/png'); assert.deepEqual(Buffer.from(await image.arrayBuffer()), png);
    const bad = new FormData(); bad.set('photo', new File(['not-an-image'], 'invalid.png', { type: 'image/png' }));
    assert.equal((await app.request('/api/me/avatar', { method: 'POST', headers, body: bad })).status, 400);
    assert.equal((await app.request('/api/me/avatar', { method: 'DELETE', headers })).status, 200);
    assert.equal((await app.request('/api/me/avatar', { headers })).status, 404);
  } finally {
    await app.request('/api/me/avatar', { method: 'DELETE', headers });
    await db.query('DELETE FROM koinonia_profiles WHERE user_id=$1', [fixture.userId]);
    await auth('/sign-out', {});
  }
});
