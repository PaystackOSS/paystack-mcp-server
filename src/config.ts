import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Define schema for required environment variables
const envSchema = z.object({
  PAYSTACK_SECRET_KEY_TEST: z.string().min(30, 'PAYSTACK_SECRET_KEY_TEST is required').refine(val => val.startsWith('sk_test_'), {
    message: 'PAYSTACK_SECRET_KEY_TEST must begin with "sk_test_. No live keys allowed."',
  }),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse({
      PAYSTACK_SECRET_KEY_TEST: process.env.PAYSTACK_SECRET_KEY_TEST,
      NODE_ENV: process.env.NODE_ENV || 'development',
      LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Environment validation failed - exit silently
      process.exit(1);
    }
    throw error;
  }
}

// Export validated configuration
export const config = validateEnv();

// Paystack API configuration
export const paystackConfig = {
  baseURL: 'https://api.paystack.co',
  secretKey: config.PAYSTACK_SECRET_KEY_TEST,
  timeout: 30000, // 30 seconds
} as const;
