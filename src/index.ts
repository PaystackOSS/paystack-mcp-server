import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import path from "path";
import { z } from "zod";
import { OpenAPIParser } from "./openapi-parser";
import { CreateMessageResultSchema } from "@modelcontextprotocol/sdk/types.js";

const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";
const USER_AGENT = process.env.USER_AGENT || "paystack-mcp/1.0";

// Create server instance
const server = new McpServer({
  name: "paystack",
  version: "1.0.0",
});

const oasPath = path.join(__dirname, "./", "data/paystack.openapi.yaml");
const openapi = new OpenAPIParser(oasPath);

// Temporarily ignore ts error on Zod schema for get_operation method
// @ts-ignore
server.registerTool(
  "get_operation",
  {
    description: "Get Paystack API operation details by operation ID",
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
      const operation = openapi.getOperationById(operation_id);

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
)

server.registerTool(
  "get_operation_guided",
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

    if(res.content.type !== "text") {
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
)

server.registerResource(
  "operation-list",
  new ResourceTemplate("openapi://operations/list", {list: undefined}),
  {
    description: "Retrieve all operation IDs",
    title: "List of Paystack API operation IDs",
    mimeType: "text/plain",
  },
  async (uri) => {
    // await openapi.parse();
    const operations = openapi.getOperations();
    const operationIds = Object.keys(operations);

    if (operationIds.length === 0) {
      return {
        contents: [
          {
            uri: uri.href,
            type: "text",
            text: "Unable to list operations.",
            mimeType: "text/plain",
          },
        ]
      }
    }

    return {
      contents: [
        {
          uri: uri.href,
          type: "text",
          text: operationIds.join("\n"),
          mimeType: "text/plain",
        },
      ]
    }
  }
)

async function main() {
  await openapi.parse();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Paystack MCP Server running on stdio...");
}


main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});