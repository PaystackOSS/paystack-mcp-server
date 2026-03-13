import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OpenAPIParser } from "../openapi-parser";
import { registerOperationListResource } from "./paystack-operation-list";
import { registerSkillResource } from "./paystack-skill";

export function registerAllResources(
  server: McpServer,
  openapi: OpenAPIParser
) {
  registerOperationListResource(server, openapi);
  registerSkillResource(server);
}
