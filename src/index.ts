import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";
const USER_AGENT = process.env.USER_AGENT || "paystack-mcp/1.0";

// Create server instance
const server = new McpServer({
  name: "paystack",
  version: "1.0.0",
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Paystack MCP Server running on stdio...");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});