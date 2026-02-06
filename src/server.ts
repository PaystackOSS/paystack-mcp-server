import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import path from "path";
import { OpenAPIParser } from "./openapi-parser";
import { registerAllTools } from "./tools";
import { registerAllResources } from "./resources";

async function createServer() {
  const server = new McpServer({
    name: "paystack",
    version: "0.0.1",
  });

  const oasPath = path.join(__dirname, "./", "data/paystack.openapi.yaml");
  const openapi = new OpenAPIParser(oasPath);

  await openapi.parse();

  registerAllTools(server, openapi);
  registerAllResources(server, openapi);

  return server;
}

export async function startServer() {
  const server = await createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Paystack MCP Server running on stdio...");
  return server;
}