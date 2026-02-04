import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OpenAPIParser } from "../openapi-parser";

export function registerOperationListResource(
  server: McpServer,
  openapi: OpenAPIParser
) {
  server.registerResource(
    "paystack_operation_list",
    "paystack://operations/list",
    {
      description: "Retrieve all Paystack API details",
      title: "Paystack API details",
      mimeType: "application/json",
    },
    async (uri) => {
      const operations = openapi.getOperations();

      if (Object.keys(operations).length === 0) {
        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify({"message": "Unable to retrive all operations"}),
              mimeType: "application/json",
            },
          ]
        }
      }
      return { 
        contents: [{
          uri: uri.href,
          text: JSON.stringify(operations, null, 2),
          mimeType: "application/json"
        }]
      };
    }
  );
}
