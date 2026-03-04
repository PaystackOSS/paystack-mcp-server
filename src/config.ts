import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({quiet: true});

// Get configuration with optional CLI API key
export function getConfig(cliApiKey?: string) {
  const apiKey = cliApiKey || process.env.PAYSTACK_TEST_SECRET_KEY;
  
  if (!apiKey) {
    console.error('Error: PAYSTACK_TEST_SECRET_KEY is required');
    process.exit(1);
  }
  
  if (!apiKey.startsWith('sk_test_')) {
    console.error('Error: PAYSTACK_TEST_SECRET_KEY must begin with "sk_test_". No live keys allowed.');
    process.exit(1);
  }
  
  if (apiKey.length < 30) {
    console.error('Error: PAYSTACK_TEST_SECRET_KEY appears to be too short');
    process.exit(1);
  }
  
  return {
    PAYSTACK_TEST_SECRET_KEY: apiKey,
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    LOG_LEVEL: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
  };
}

// Paystack API configuration factory
export function createPaystackConfig(cliApiKey?: string) {
  const cfg = getConfig(cliApiKey);
  return {
    baseURL: 'https://api.paystack.co',
    secretKey: cfg.PAYSTACK_TEST_SECRET_KEY,
    timeout: 30000, // 30 seconds
  } as const;
}
