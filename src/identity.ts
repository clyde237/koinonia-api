import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import type { Config } from './config.js';

export function createIdentityVerifier(config: Config, keys?: JWTVerifyGetKey) {
  const jwks = keys ?? createRemoteJWKSet(new URL(config.NEON_AUTH_JWKS_URL), { timeoutDuration: 10000, cooldownDuration: 30000, cacheMaxAge: 600000 });
  const origin = new URL(config.NEON_AUTH_URL).origin;
  return async (token: string) => {
    const { payload } = await jwtVerify(token, jwks, { algorithms: ['EdDSA'], issuer: origin, audience: origin, requiredClaims: ['sub', 'exp', 'iat'], clockTolerance: 5 });
    if (!payload.sub || payload.banned === true) throw new Error('Identité non autorisée.');
    return payload.sub;
  };
}
