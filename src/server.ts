import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import path from "path";
import { OpenAPIParser } from "./openapi-parser";
import { registerAllTools } from "./tools";
import { registerAllResources } from "./resources";

const SERVER_INSTRUCTIONS = `You are connected to the Paystack MCP Server, which provides access to the full Paystack API.

## Source Priority
1. Use this server's tools and resources as the primary source of truth for API details:
   - "paystack_operation_list" resource: browse all available API operations
   - "get_paystack_operation" tool: get endpoint details (method, path, parameters, request body)
   - "make_paystack_request" tool: execute API requests
2. For integration guides, best practices, and deeper context, refer to Paystack documentation at https://paystack.com/docs/llms.txt
3. For code snippets in JS/TS or cURL, refer to the "paystack_skill" resource for links
4. If information is not available from the above sources, say so clearly — do not invent Paystack-specific details

## Critical Accuracy Rules
- All amounts must be in the smallest currency unit: kobo (NGN), pesewas (GHS), cents (ZAR/KES/USD). XOF has no subunit but amounts must still be multiplied by 100.
- API requests require authentication: secret keys (server-side) or public keys (client-side only for Popup/Mobile SDKs)
- This server only accepts test keys (sk_test_*). Never use live keys.
- Always verify transactions server-side before delivering value
- Validate webhook signatures using your secret key before processing events
- Supported currencies: NGN (Nigeria), GHS (Ghana), ZAR (South Africa), KES (Kenya), USD (International)

## Workflow
Always call "get_paystack_operation" to get endpoint details before calling "make_paystack_request". Do not guess endpoint paths, methods, or parameter names.
`;

async function createServer(cliApiKey?: string) {
  const server = new McpServer({
    name: "paystack",
    version: "0.0.1",
  }, {
    instructions: SERVER_INSTRUCTIONS,
  });

  const oasPath = path.join(__dirname, "./", "data/paystack.openapi.yaml");
  const openapi = new OpenAPIParser(oasPath);

  await openapi.parse();

  registerAllTools(server, openapi, cliApiKey);
  registerAllResources(server, openapi);

  return server;
}

export async function startServer(cliApiKey?: string) {
  const server = await createServer(cliApiKey);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Paystack MCP Server running on stdio...");
  return server;
}