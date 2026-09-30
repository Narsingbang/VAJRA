import { supabaseAdmin } from '../config/supabase.js';
import { buildFollowupPrompt } from '../prompts/promptBuilder.js';
import { generateStructured } from './geminiService.js';
import { parseAiOutput } from '../validators/outputs.js';
import { checkAndEnforceQuota, recordAiUsage } from './quotaService.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export async function askFollowup(userId, advisoryId, question) {
  // Check daily quota
  await checkAndEnforceQuota(userId);

  // Load advisory
  const { data: advisory, error: advError } = await supabaseAdmin
    .from('advisories')
    .select('*')
    .eq('id', advisoryId)
    .eq('user_id', userId)
    .single();

  if (advError || !advisory) {
    throw new NotFoundError('Advisory not found');
  }

  // Count existing followups (max 10)
  const { data: existingFollowups, error: countError } = await supabaseAdmin
    .from('advisory_followups')
    .select('id, question, answer')
    .eq('advisory_id', advisoryId)
    .order('created_at', { ascending: true });

  if (countError) throw countError;

  if (existingFollowups && existingFollowups.length >= 10) {
    throw new ValidationError('Maximum of 10 follow-up questions reached for this advisory.');
  }

  const prompt = buildFollowupPrompt(advisory, existingFollowups || [], question);

  const aiResponse = await generateStructured({
    module: 'followup',
    prompt
  });

  const parsedAnswer = parseAiOutput('followup', aiResponse.text);

  const { data: followupRecord, error: insertError } = await supabaseAdmin
    .from('advisory_followups')
    .insert({
      advisory_id: advisoryId,
      user_id: userId,
      question,
      answer: parsedAnswer
    })
    .select('*')
    .single();

  if (insertError) throw insertError;

  await recordAiUsage(userId, 'followup');

  return followupRecord;
}

export async function upsertFeedback(userId, advisoryId, rating, comment = null) {
  // Verify advisory ownership
  const { data: advisory, error: advError } = await supabaseAdmin
    .from('advisories')
    .select('id')
    .eq('id', advisoryId)
    .eq('user_id', userId)
    .single();

  if (advError || !advisory) {
    throw new NotFoundError('Advisory not found');
  }

  const { data: feedback, error } = await supabaseAdmin
    .from('advisory_feedback')
    .upsert(
      {
        advisory_id: advisoryId,
        user_id: userId,
        rating,
        comment
      },
      { onConflict: 'advisory_id,user_id' }
    )
    .select('*')
    .single();

  if (error) throw error;
  return feedback;
}
