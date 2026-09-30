import { ai, GEMINI_MODEL } from '../config/gemini.js';
import { SYSTEM_PROMPT } from '../prompts/systemPrompt.js';
import { outputJsonSchemas } from '../prompts/jsonSchemas.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { AiError } from '../utils/errors.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calls Gemini models with structured JSON schema output and retry logic.
 * 
 * @param {object} params
 * @param {string} params.module - The module name or 'followup'
 * @param {string} params.prompt - The formatted prompt string
 * @param {Array<{mimetype: string, buffer: Buffer}>} [params.images] - Attached image buffers
 * @returns {Promise<{text: string, promptTokens: number, outputTokens: number}>}
 */
export async function generateStructured({ module, prompt, images = [] }) {
  const parts = [{ text: prompt }];

  for (const img of images) {
    parts.push({
      inlineData: {
        mimeType: img.mimetype,
        data: img.buffer.toString('base64')
      }
    });
  }

  const schema = outputJsonSchemas[module];
  if (!schema) {
    throw new AiError(`No JSON schema configured for module: ${module}`);
  }

  const maxRetries = 2;
  const backoffDelays = [500, 1500];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.AI_TIMEOUT_MS);

    try {
      logger.info('Invoking Gemini API', {
        module,
        model: GEMINI_MODEL,
        attempt: attempt + 1,
        imageCount: images.length
      });

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: 'user', parts }],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: env.AI_TEMPERATURE,
          maxOutputTokens: env.AI_MAX_OUTPUT_TOKENS,
          responseMimeType: 'application/json',
          responseJsonSchema: schema,
          abortSignal: controller.signal
        }
      });

      clearTimeout(timeoutId);

      const text = response.text || '';
      const usage = response.usageMetadata || {};

      return {
        text,
        promptTokens: usage.promptTokenCount || 0,
        outputTokens: usage.candidatesTokenCount || 0
      };
    } catch (err) {
      clearTimeout(timeoutId);

      const isTimeout = err.name === 'AbortError' || controller.signal.aborted;
      const status = err.status || err.statusCode;
      const isTransient = isTimeout || status === 429 || status === 500 || status === 503;

      logger.warn('Gemini invocation error', {
        attempt: attempt + 1,
        isTransient,
        error: err.message
      });

      if (attempt < maxRetries && isTransient) {
        await sleep(backoffDelays[attempt]);
        continue;
      }

      throw new AiError(
        isTimeout
          ? 'AI generation timed out. Please try again.'
          : (err.message || 'Error occurred during AI generation.')
      );
    }
  }
}
