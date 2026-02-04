import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CreateMessageResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { OpenAPIParser } from "../openapi-parser";

export function registerGetOperationGuidedTool(
  server: McpServer,
  openapi: OpenAPIParser
) {
  server.registerTool(
    "get_paystack_operation_guided",
    {
      description: "Get Paystack API operation details from user input",
      annotations: {
        title: "Get endpoint details from user input",
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async () => {
      const res = await server.server.request({
        method: "sampling/createMessage",
        params: {
          messages: [{
            role: "user",
            content: [
              {
                type: "text",
                text: `Review the OpenAPI specification and infer the operation ID of the 
              Paystack API endpoint from the user input. 
              For example if the user's input is: 'I want to create a new customer in Paystack.'
              review the OpenAPI spec and respond with the most logical operationId:
              which is 'customer_create'. Return just the operationId in your response.`,
              },
            ],
          }],
          maxTokens: 1024,
        }
      }, CreateMessageResultSchema)

      if (res.content.type !== "text") {
        return {
          content: [
            {
              type: "text",
              text: `Could not infer operation ID from user input.`,
            }
          ]
        }
      }

      try {
        const operation_id = res.content.text.trim();
        const operation = openapi.getOperationById(operation_id);

        if (!operation) {
          return {
            content: [
              {
                type: "text",
                text: `Operation with ID ${operation_id} not found.`,
              },
            ],
            isError: true,
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
              text: `Operation with ID cannot be infered.`,
            },
          ]
        }
      }
    }
  );
}
