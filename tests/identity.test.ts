import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { createIdentityVerifier } from '../src/identity.js';
import { readConfig } from '../src/config.js';
import { profileSchema } from '../src/profile.js';

const config = readConfig({ NODE_ENV: 'test', API_URL: 'http://localhost:3000', NEON_AUTH_URL: 'https://identity.example/auth', NEON_AUTH_JWKS_URL: 'https://identity.example/auth/jwks', DATABASE_URL: 'postgresql://unused', DIRECT_DATABASE_URL: 'postgresql://unused' });
const { publicKey, privateKey } = await generateKeyPair('EdDSA');
const publicJwk = await exportJWK(publicKey);
const verify = createIdentityVerifier(config, createLocalJWKSet({ keys: [{ ...publicJwk, kid: 'test', alg: 'EdDSA' }] }));
const signed = (issuer = 'https://identity.example', expires = '5m', extras = {}) => new SignJWT(extras).setProtectedHeader({ alg: 'EdDSA', kid: 'test' }).setSubject('member-123').setIssuedAt().setIssuer(issuer).setAudience('https://identity.example').setExpirationTime(expires).sign(privateKey);

test('identifie le membre à partir d’un jeton signé du fournisseur attendu', async () => { assert.equal(await verify(await signed()), 'member-123'); });
test('refuse une signature forgée, une autre origine et un jeton expiré', async () => {
  await assert.rejects(verify('eyJhbGciOiJFZERTQSJ9.forged.forged'));
  await assert.rejects(verify(await signed('https://other.example')));
  await assert.rejects(verify(await signed('https://identity.example', '-1h')));
});
test('refuse une identité bannie', async () => { await assert.rejects(verify(await signed(undefined, undefined, { banned: true }))); });
test('le profil ne permet pas de modifier l’identité ni un rôle', () => {
  const base = { phone: '', country: '', city: '', church: '', noChurch: true, interests: [], period: 'Aujourd’hui', requestedGroups: [], breakfastNotifications: true, communityNotifications: true, onboardingStep: 1 };
  assert.equal(profileSchema.safeParse(base).success, true);
  assert.equal(profileSchema.safeParse({ ...base, userId: 'another-member', role: 'admin' }).success, false);
  assert.equal(profileSchema.safeParse({ ...base, onboardingStep: 99 }).success, false);
});
