import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OpenAPIParser } from "../openapi-parser";
import { registerGetPaystackOperationTool } from "./get-paystack-operation";
import { registerMakePaystackRequestTool } from "./make-paystack-request";
import { registerGetOperationGuidedTool } from "./get-operation-guided";

export function registerAllTools(
  server: McpServer,
  openapi: OpenAPIParser
) {
  registerGetPaystackOperationTool(server, openapi);
  registerMakePaystackRequestTool(server);
  registerGetOperationGuidedTool(server, openapi);
}
