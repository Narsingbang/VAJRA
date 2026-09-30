import { supabaseAdmin } from '../config/supabase.js';
import { getKolkataDayBounds } from '../utils/time.js';
import { env } from '../config/env.js';
import { QuotaExceededError } from '../utils/errors.js';

export async function getUserQuota(userId) {
  const { startUtcIso, resetsAt } = getKolkataDayBounds();

  const { count, error } = await supabaseAdmin
    .from('ai_usage_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startUtcIso);

  if (error) {
    // If table not set up or offline, fallback safely
    return {
      used: 0,
      limit: env.DAILY_AI_REQUEST_LIMIT,
      remaining: env.DAILY_AI_REQUEST_LIMIT,
      resets_at: resetsAt
    };
  }

  const used = count || 0;
  const limit = env.DAILY_AI_REQUEST_LIMIT;
  const remaining = Math.max(0, limit - used);

  return {
    used,
    limit,
    remaining,
    resets_at: resetsAt
  };
}

export async function checkAndEnforceQuota(userId) {
  const quota = await getUserQuota(userId);
  if (quota.used >= quota.limit) {
    throw new QuotaExceededError(
      `Daily AI request limit of ${quota.limit} reached. Quota resets at ${quota.resets_at}`
    );
  }
  return quota;
}

export async function recordAiUsage(userId, kind = 'advisory') {
  try {
    await supabaseAdmin
      .from('ai_usage_log')
      .insert({
        user_id: userId,
        kind
      });
  } catch (err) {
    // Non-blocking log insertion failure
    console.error('Failed to log AI usage:', err.message);
  }
}
