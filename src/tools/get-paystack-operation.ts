import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod";
import { OpenAPIParser } from "../openapi-parser";

export function registerGetPaystackOperationTool(
  server: McpServer,
  openapi: OpenAPIParser
) {
  const operations = openapi.getOperations();

  server.registerTool(
    "get_paystack_operation",
    {
      description: `Get Paystack API operation details by operation ID. Available
      operations are:
      ${Object.keys(operations).map(operation => operation).join(", ") }`,
      annotations: {
        title: "Get endpoint details by operation ID",
      },
      inputSchema: {
        operation_id: z
          .string()
          .describe("The operation ID of the Paystack API endpoint"),
      }
    },
    async ({ operation_id }) => {
      try {
        const operation = openapi.getOperationById(operation_id.trim());

        if (!operation) {
          return {
            content: [
              {
                type: "text",
                text: `Operation with ID ${operation_id} not found.`,
              },
            ]
          }
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(operation, null, 2),
              mimeType: "application/json",
            },
          ]
        }
      } catch {
        return {
          content: [
            {
              type: "text",
              text: `Operation with ID ${operation_id} not found.`,
            },
          ]
        }
      }
    }
  );
}
