import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod";
import { paystackClient } from "../paystack-client";

export function registerMakePaystackRequestTool(server: McpServer) {
  server.registerTool(
    "make_paystack_request",
    {
      description: `Make a Paystack API request using the details of the operation. Be sure 
    to get all operation details including method, path path parameters, query parameters, 
    and request body before making a call.`,
      annotations: {
        title: "Make a Paystack API request",
      },
      inputSchema: {
        request: z.object({
          method: z.string().describe("HTTP method of the API request"),
          path: z.string().describe("Path of the API request"),
          data: z.looseObject({}).optional().describe("Request data"),
        })
      }
    },
    async ({ request }) => {
      try {
        const response = await paystackClient.makeRequest(
          request.method,
          request.path,
          request.data
        )

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2),
              mimeType: "application/json",
            },
          ]
        }
      } catch(error) {
        return {
          content: [
            {
              type: "text",
              text: `Unable to make request. ${error}`,
            },
          ]
        }
      }
    }
  );
}
