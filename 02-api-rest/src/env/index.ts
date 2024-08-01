import { config } from 'dotenv';
import { z } from 'zod';

// use test or dev .env
process.env.NODE_ENV === 'test' ? config({ path: '.env.test' }) : config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
});

// validation that dburl exists and is a string
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables!', _env.error.format());

  throw new Error('Invalid Environment Variables!');
}

export const env = _env.data;
