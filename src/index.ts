
// Simple CLI argument parsing
function parseApiKey(): string | undefined {
  const args = process.argv;
  const apiKeyIndex = args.findIndex(arg => arg === '--api-key');
  
  if (apiKeyIndex !== -1 && apiKeyIndex + 1 < args.length) {
    return args[apiKeyIndex + 1];
  }
  
  return undefined;
}

// Show help message
function showHelp() {
  console.log(`
Paystack MCP Server

Usage:
  npx @paystack/mcp-server --api-key <your-test-secret-key>

Options:
  --api-key <key>  Your Paystack test secret key (starts with sk_test_)
  --help, -h       Show this help message

Environment Variables:
  PAYSTACK_TEST_SECRET_KEY  Fallback if --api-key not provided

Examples:
  npx @paystack/mcp-server --api-key sk_test_1234567890abcdef
  PAYSTACK_TEST_SECRET_KEY=sk_test_... npx @paystack/mcp-server
`);
}

async function main() {
  // Handle help flag
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showHelp();
    process.exit(0);
  }
  
  const { startServer } = await import("./server");

  // Parse API key from CLI
  const cliApiKey = parseApiKey();
  
 
  // Check if we have an API key from CLI or environment
  if (!cliApiKey && !process.env.PAYSTACK_TEST_SECRET_KEY) {
    console.error('Error: Paystack API key required.');
    console.error('Provide via --api-key argument or PAYSTACK_TEST_SECRET_KEY environment variable.');
    showHelp();
    process.exit(1);
  }
  
  await startServer(cliApiKey);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});