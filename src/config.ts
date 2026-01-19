import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Define schema for required environment variables
const envSchema = z.object({
  PAYSTACK_SECRET_KEY_TEST: z.string().min(1, 'PAYSTACK_SECRET_KEY_TEST is required'),
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
      console.error('Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\nPlease check your .env file and ensure all required variables are set.');
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
