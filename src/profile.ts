import { z } from 'zod';
import type { Database } from './db.js';

export const periods = ['Aujourd’hui', '7 derniers jours', '14 derniers jours', '30 derniers jours'] as const;
const optionalText = z.string().trim().max(120);
export const profileSchema = z.object({
  phone: z.string().trim().max(32), country: optionalText, city: optionalText, church: optionalText,
  noChurch: z.boolean(),
  interests: z.array(z.enum(['Prière', 'Foi', 'Vie chrétienne', 'Famille', 'Croissance spirituelle'])).max(5),
  period: z.enum(periods), requestedGroups: z.array(z.enum(['matin', 'partage'])).max(2),
  breakfastNotifications: z.boolean(), communityNotifications: z.boolean(),
  onboardingStep: z.number().int().min(0).max(5),
}).strict();
export const defaultProfile = { phone: '', country: '', city: '', church: '', noChurch: false, interests: [] as string[], period: periods[0], requestedGroups: [] as string[], breakfastNotifications: true, communityNotifications: true };

export async function getProfile(pool: Database, userId: string, baseURL: string) {
  const result = await pool.query('SELECT data, onboarding_step, onboarding_completed_at FROM koinonia_profiles WHERE user_id = $1', [userId]);
  const row = result.rows[0];
  return { ...defaultProfile, ...row?.data, avatarKey: undefined, onboardingStep: row?.onboarding_step ?? 0,
    onboardingCompleted: Boolean(row?.onboarding_completed_at),
    photo: row?.data?.avatarKey ? `/api/me/avatar?v=${encodeURIComponent(row.data.avatarKey)}` : null };
}

export async function saveProfile(pool: Database, userId: string, input: z.infer<typeof profileSchema>) {
  const { onboardingStep, ...data } = input;
  if (data.noChurch) data.church = '';
  data.interests = [...new Set(data.interests)];
  data.requestedGroups = [...new Set(data.requestedGroups)];
  await pool.query(`INSERT INTO koinonia_profiles (user_id, data, onboarding_step, onboarding_completed_at)
    VALUES ($1, $2::jsonb, $3::smallint, CASE WHEN $3::smallint = 5 THEN now() ELSE NULL END)
    ON CONFLICT (user_id) DO UPDATE SET data = koinonia_profiles.data || EXCLUDED.data,
    onboarding_step = GREATEST(koinonia_profiles.onboarding_step, EXCLUDED.onboarding_step),
    onboarding_completed_at = COALESCE(koinonia_profiles.onboarding_completed_at, EXCLUDED.onboarding_completed_at), updated_at = now()`, [userId, JSON.stringify(data), onboardingStep]);
}
