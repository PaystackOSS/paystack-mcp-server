import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OpenAPIParser } from "../openapi-parser";
import { registerGetPaystackOperationTool } from "./get-paystack-operation";
import { registerMakePaystackRequestTool } from "./make-paystack-request";

export function registerAllTools(
  server: McpServer,
  openapi: OpenAPIParser
) {
  registerGetPaystackOperationTool(server, openapi);
  registerMakePaystackRequestTool(server);
}
