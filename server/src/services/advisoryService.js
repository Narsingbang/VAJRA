import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { buildPrompt, buildRepairPrompt } from '../prompts/promptBuilder.js';
import { generateStructured } from './geminiService.js';
import { parseAiOutput } from '../validators/outputs.js';
import { safetyPostProcessor } from './safetyPostProcessor.js';
import { checkAndEnforceQuota, recordAiUsage } from './quotaService.js';
import { uploadAdvisoryImages, getSignedImageUrls, deleteAdvisoryImages } from './storageService.js';
import { NotFoundError, ForbiddenError, AiInvalidOutputError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export async function createAdvisory(userId, inputData, files = []) {
  // 1. Quota Check
  await checkAndEnforceQuota(userId);

  // 2. Farm enrichment if farm_id supplied
  let enrichedInput = { ...inputData };
  if (inputData.farm_id) {
    const { data: farm, error } = await supabaseAdmin
      .from('farms')
      .select('*')
      .eq('id', inputData.farm_id)
      .eq('user_id', userId)
      .single();

    if (error || !farm) {
      throw new ForbiddenError('Specified farm not found or does not belong to you.');
    }

    enrichedInput = {
      ...inputData,
      state: inputData.state || farm.state,
      district: inputData.district || farm.district,
      soil_type: inputData.soil_type || farm.soil_type,
      irrigation_source: inputData.irrigation_source || farm.irrigation_source,
      area_acres: inputData.area_acres || farm.area_acres
    };
  }

  // 3. Build prompt
  const module = enrichedInput.module;
  const initialPrompt = buildPrompt(module, enrichedInput, files.length);

  const startTime = Date.now();
  let aiResponse;
  let parsedResult = null;
  let validationError = null;

  // 4. Initial AI call
  try {
    aiResponse = await generateStructured({
      module,
      prompt: initialPrompt,
      images: files
    });

    try {
      parsedResult = parseAiOutput(module, aiResponse.text);
    } catch (parseErr) {
      validationError = parseErr;
    }
  } catch (err) {
    // If Gemini call itself failed
    throw err;
  }

  // 5. Automatic 1-time Repair Retry if schema validation failed
  if (!parsedResult && validationError) {
    logger.warn('Initial AI output failed validation, attempting 1-time repair retry', {
      module,
      issues: validationError.issues
    });

    const repairPrompt = `${initialPrompt}\n\n${buildRepairPrompt(validationError.message)}`;

    try {
      const retryResponse = await generateStructured({
        module,
        prompt: repairPrompt,
        images: files
      });

      try {
        parsedResult = parseAiOutput(module, retryResponse.text);
        aiResponse = retryResponse; // Update token usage info
      } catch (retryParseErr) {
        // Record failed advisory attempt in DB before throwing
        const latencyMs = Date.now() - startTime;
        await supabaseAdmin.from('advisories').insert({
          user_id: userId,
          farm_id: enrichedInput.farm_id || null,
          module,
          crop: enrichedInput.crop || null,
          language: enrichedInput.language || 'en',
          input: enrichedInput,
          result: null,
          status: 'failed',
          error_message: retryParseErr.message,
          latency_ms: latencyMs
        });

        // Consumes 1 quota unit on persistent failure
        await recordAiUsage(userId, 'advisory');

        throw new AiInvalidOutputError(
          'The AI model generated an invalid format twice. Please try with different symptoms or notes.',
          retryParseErr.issues || []
        );
      }
    } catch (retryErr) {
      if (retryErr instanceof AiInvalidOutputError) throw retryErr;
      throw retryErr;
    }
  }

  const latencyMs = Date.now() - startTime;

  // 6. Safety Post Processing
  const finalResult = safetyPostProcessor(module, enrichedInput, parsedResult);

  // 7. Upload images only after AI generation success
  const advisoryId = crypto.randomUUID();
  let imagePaths = [];
  if (files && files.length > 0) {
    imagePaths = await uploadAdvisoryImages(userId, advisoryId, files);
  }

  // 8. Persist advisory and usage log
  const { data: savedAdvisory, error: saveError } = await supabaseAdmin
    .from('advisories')
    .insert({
      id: advisoryId,
      user_id: userId,
      farm_id: enrichedInput.farm_id || null,
      module,
      crop: enrichedInput.crop || (finalResult.best_pick || null),
      language: enrichedInput.language || 'en',
      input: enrichedInput,
      result: finalResult,
      risk_level: finalResult.risk_level || 'low',
      confidence: finalResult.confidence || 'medium',
      status: 'completed',
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      prompt_tokens: aiResponse.promptTokens,
      output_tokens: aiResponse.outputTokens,
      latency_ms: latencyMs,
      image_paths: imagePaths
    })
    .select('*')
    .single();

  if (saveError) {
    logger.error('Failed to save advisory to database', { error: saveError.message });
    throw saveError;
  }

  await recordAiUsage(userId, 'advisory');

  return savedAdvisory;
}

export async function listAdvisories(userId, filters = {}) {
  const { module, crop, farm_id, q, from, to, page = 1, pageSize = 10 } = filters;

  let query = supabaseAdmin
    .from('advisories')
    .select('id, user_id, farm_id, module, crop, language, risk_level, confidence, status, created_at, result->summary', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (module) query = query.eq('module', module);
  if (crop) query = query.ilike('crop', `%${crop}%`);
  if (farm_id) query = query.eq('farm_id', farm_id);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);
  if (q) {
    query = query.textSearch('search_vector', q, { type: 'websearch' });
  }

  const offset = (page - 1) * pageSize;
  query = query.range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    items: data || [],
    pagination: {
      page: Number(page),
      pageSize: Number(pageSize),
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize)
    }
  };
}

export async function getAdvisoryById(userId, advisoryId) {
  const { data: advisory, error } = await supabaseAdmin
    .from('advisories')
    .select(`
      *,
      farm:farms(id, name, state, district),
      followups:advisory_followups(id, question, answer, created_at),
      feedback:advisory_feedback(rating, comment, created_at)
    `)
    .eq('id', advisoryId)
    .eq('user_id', userId)
    .single();

  if (error || !advisory) {
    throw new NotFoundError('Advisory not found');
  }

  // Generate signed URLs for uploaded images
  let signedImages = [];
  if (Array.isArray(advisory.image_paths) && advisory.image_paths.length > 0) {
    signedImages = await getSignedImageUrls(advisory.image_paths);
  }

  return {
    ...advisory,
    signed_images: signedImages
  };
}

export async function deleteAdvisory(userId, advisoryId) {
  // Load to get image_paths
  const { data: advisory, error } = await supabaseAdmin
    .from('advisories')
    .select('image_paths')
    .eq('id', advisoryId)
    .eq('user_id', userId)
    .single();

  if (error || !advisory) {
    throw new NotFoundError('Advisory not found');
  }

  // Delete images in storage
  if (Array.isArray(advisory.image_paths) && advisory.image_paths.length > 0) {
    await deleteAdvisoryImages(advisory.image_paths);
  }

  // Delete record
  const { error: deleteError } = await supabaseAdmin
    .from('advisories')
    .delete()
    .eq('id', advisoryId)
    .eq('user_id', userId);

  if (deleteError) throw deleteError;

  return { success: true };
}
