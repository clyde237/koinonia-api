import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { readConfig } from '../src/config.js';
import { createDatabase } from '../src/db.js';
import { createApp } from '../src/app.js';
import { createIdentityVerifier } from '../src/identity.js';

test('Neon réel : compte, session, JWT, profil persistant et déconnexion', { skip: process.env.RUN_DATABASE_TESTS !== '1', timeout: 120000 }, async () => {
  const config = readConfig();
  const db = createDatabase(config);
  const app = createApp({ config, pool: db, verifyIdentity: createIdentityVerifier(config) });
  const cookie = new Map<string, string>();
  const fixturePath = join(config.DATA_DIR, 'integration-user.json');
  const stored = await readFile(fixturePath, 'utf8').then(value => JSON.parse(value)).catch(() => null);
  let password: string = stored?.password ?? `${randomUUID()}-Aa!`;
  const email: string = stored?.email ?? `koinonia-test-${randomUUID()}@example.invalid`;
  const saveFixture = async () => {
    await mkdir(config.DATA_DIR, { recursive: true, mode: 0o700 });
    await writeFile(fixturePath, JSON.stringify({ email, password, userId }), { mode: 0o600 });
  };
  let userId: string | undefined;
  const auth = async (path: string, body?: unknown) => {
    const response = await fetch(`${config.NEON_AUTH_URL}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { Origin: 'http://localhost:3000', 'Content-Type': 'application/json', Cookie: [...cookie].map(([key, value]) => `${key}=${value}`).join('; ') },
      body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(20000),
    });
    for (const value of response.headers.getSetCookie()) {
      const [pair] = value.split(';'); const separator = pair.indexOf('=');
      const key = pair.slice(0, separator), content = pair.slice(separator + 1);
      if (content) cookie.set(key, content); else cookie.delete(key);
    }
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    return { response, data };
  };
  try {
    const created = await auth(stored ? '/sign-in/email' : '/sign-up/email', { email, password, name: 'Test intégration' });
    assert.equal(created.response.status, 200, `Inscription : ${created.data?.code ?? 'échec'}`);
    if (stored) { assert.equal(created.data.redirect, false); assert.equal(created.data.url, undefined); }
    userId = created.data.user.id;
    assert.ok(userId);
    await saveFixture();
    const session = await auth('/get-session');
    assert.equal(session.data.user.id, userId);
    const token = await auth('/token');
    assert.equal(token.response.status, 200);
    const headers = { Authorization: `Bearer ${token.data.token}`, 'X-Koinonia-Client': 'mobile', 'Content-Type': 'application/json' };
    const anonymous = await app.request('/api/me/profile'); assert.equal(anonymous.status, 401);
    const forged = await app.request('/api/me/profile', { headers: { Authorization: 'Bearer forged' } }); assert.equal(forged.status, 401);
    const profile = { phone: '+237600000000', country: 'Cameroun', city: 'Bafoussam', church: '', noChurch: true, interests: ['Foi'], period: '7 derniers jours', requestedGroups: ['matin'], breakfastNotifications: true, communityNotifications: false, onboardingStep: 5 };
    const invalid = await app.request('/api/me/profile', { method: 'PUT', headers, body: JSON.stringify({ ...profile, userId: 'other' }) }); assert.equal(invalid.status, 400);
    const saved = await app.request('/api/me/profile', { method: 'PUT', headers, body: JSON.stringify(profile) }); assert.equal(saved.status, 200);
    const reread = await app.request('/api/me/profile', { headers });
    const data = await reread.json(); assert.equal(data.country, 'Cameroun'); assert.equal(data.onboardingCompleted, true); assert.deepEqual(data.requestedGroups, ['matin']);
    const persisted = await db.query('SELECT onboarding_step, data FROM koinonia_profiles WHERE user_id=$1', [userId]); assert.equal(persisted.rows[0].onboarding_step, 5);
    const rejected = await auth('/change-password', { currentPassword: 'incorrect-current-password', newPassword: 'This-is-not-the-password-123', revokeOtherSessions: true }); assert.equal(rejected.response.ok, false);
    const nextPassword = `${randomUUID()}-Aa!`;
    const changed = await auth('/change-password', { currentPassword: password, newPassword: nextPassword, revokeOtherSessions: true });
    assert.equal(changed.response.status, 200, `Changement : ${changed.data?.code ?? 'échec'}`);
    password = nextPassword; await saveFixture();
    const invalidReset = await auth('/email-otp/reset-password', { email, otp: '000000', password: 'Attempt-without-code-123' }); assert.equal(invalidReset.response.ok, false);
    const logout = await auth('/sign-out', {}); assert.equal(logout.response.status, 200);
    const signedOut = await auth('/get-session'); assert.equal(signedOut.data, null);
    const wrong = await auth('/sign-in/email', { email, password: 'incorrect-pass' }); assert.equal(wrong.response.status, 401);
    const login = await auth('/sign-in/email', { email, password }); assert.equal(login.response.status, 200);
    assert.equal(login.data.redirect, false); assert.equal(login.data.url, undefined);
  } finally {
    // Nettoyage strictement limité au compte synthétique créé par ce test.
    if (userId) {
      await db.query('DELETE FROM koinonia_profiles WHERE user_id=$1', [userId]);
      // Le service géré n’expose pas /delete-user. Réutiliser ce compte technique.
      await auth('/sign-out', {});
    }
  }
});
