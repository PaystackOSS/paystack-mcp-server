#!/usr/bin/env node
import dotenv from 'dotenv';

dotenv.config();

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TOOLS } from './tools/index';
import { RESOURCES } from './resources/index';

// Create server instance
const server = new McpServer({
  name: "paystack",
  version: "1.0.0",
  description: "Paystack MCP Server"
});

TOOLS.forEach(tool => {
  server.registerTool(
    tool.definition.name,
    {
      description: tool.definition.description,
      annotations: tool.definition.annotations,
      _meta: tool.definition._meta
    },
    tool.handler
  );
});

RESOURCES.forEach(resource => {
  server.registerResource(
    resource.definition.name,
    resource.definition.uri,
    {
      description: resource.definition.description,
      mimeType: resource.definition.mimeType,
      annotations: resource.definition.annotations,
      _meta: resource.definition._meta
    },
    resource.handler
  );
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