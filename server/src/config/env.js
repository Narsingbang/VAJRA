import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  AI_TEMPERATURE: z.coerce.number().default(0.3),
  AI_MAX_OUTPUT_TOKENS: z.coerce.number().default(4096),
  AI_TIMEOUT_MS: z.coerce.number().default(45000),

  DAILY_AI_REQUEST_LIMIT: z.coerce.number().default(30),
  MAX_IMAGES_PER_REQUEST: z.coerce.number().default(3),
  MAX_IMAGE_MB: z.coerce.number().default(4)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ FATAL: Invalid or missing server environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
  }
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
    console.warn('⚠️ Running in development/test with fallback defaults where applicable.');
  }
}

export const env = parsed.success ? parsed.data : {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 5000),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'placeholder-gemini-api-key',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  AI_TEMPERATURE: Number(process.env.AI_TEMPERATURE || 0.3),
  AI_MAX_OUTPUT_TOKENS: Number(process.env.AI_MAX_OUTPUT_TOKENS || 4096),
  AI_TIMEOUT_MS: Number(process.env.AI_TIMEOUT_MS || 45000),
  DAILY_AI_REQUEST_LIMIT: Number(process.env.DAILY_AI_REQUEST_LIMIT || 30),
  MAX_IMAGES_PER_REQUEST: Number(process.env.MAX_IMAGES_PER_REQUEST || 3),
  MAX_IMAGE_MB: Number(process.env.MAX_IMAGE_MB || 4)
};
