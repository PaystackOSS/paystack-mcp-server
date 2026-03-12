import assert from "node:assert";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerMakePaystackRequestTool } from "../src/tools/make-paystack-request.js";

describe("MakePaystackRequestTool", () => {
  describe("Error handling with isError flag", () => {
    let server: McpServer;
    let toolHandler: any;

    before(() => {
      // Create a mock MCP server
      server = {
        registerTool: (name: string, config: any, handler: any) => {
          if (name === "make_paystack_request") {
            toolHandler = handler;
          }
        }
      } as any;

      // Pass a test API key to avoid environment variable requirement  
      registerMakePaystackRequestTool(server, "sk_test_1234567890abcdef1234567890abcdef12345678");
    });

    it("should return isError: true for non-JSON responses", async () => {
      // Mock fetch to return HTML error page
      const originalFetch = global.fetch;
      global.fetch = async () => {
        return {
          status: 502,
          text: async () => "<html><body><h1>502 Bad Gateway</h1></body></html>",
        } as Response;
      };

      try {
        const result = await toolHandler({
          request: {
            method: "GET",
            path: "/test-endpoint",
          }
        });

        // Verify isError flag is set
        assert.strictEqual(result.isError, true);
        
        // Verify error message content
        assert.ok(result.content);
        assert.strictEqual(result.content.length, 1);
        assert.strictEqual(result.content[0].type, "text");
        assert.ok(result.content[0].text.includes("Unable to make request"));
        assert.ok(result.content[0].text.includes("HTTP 502"));
        assert.ok(result.content[0].text.includes("non-JSON response"));
      } finally {
        global.fetch = originalFetch;
      }
    });

    it("should omit isError for successful responses", async () => {
      // Mock fetch to return valid JSON
      const originalFetch = global.fetch;
      const validJsonResponse = {
        status: true,
        message: "Success",
        data: { id: 123 }
      };
      
      global.fetch = async () => {
        return {
          status: 200,
          text: async () => JSON.stringify(validJsonResponse),
        } as Response;
      };

      try {
        const result = await toolHandler({
          request: {
            method: "GET",
            path: "/test-endpoint",
          }
        });

        // Verify isError is not set (or false) for successful responses
        assert.ok(!result.isError);
        
        // Verify success content
        assert.ok(result.content);
        assert.strictEqual(result.content.length, 1);
        assert.strictEqual(result.content[0].type, "text");
        assert.strictEqual(result.content[0].mimeType, "application/json");
        
        // Parse and verify the response data
        const parsedResponse = JSON.parse(result.content[0].text);
        assert.strictEqual(parsedResponse.status, true);
        assert.strictEqual(parsedResponse.message, "Success");
      } finally {
        global.fetch = originalFetch;
      }
    });

    it("should include HTTP status code in error message", async () => {
      // Mock fetch to return a 504 Gateway Timeout
      const originalFetch = global.fetch;
      global.fetch = async () => {
        return {
          status: 504,
          text: async () => "Gateway Timeout",
        } as Response;
      };

      try {
        const result = await toolHandler({
          request: {
            method: "POST",
            path: "/transaction/initialize",
            data: { amount: 1000 }
          }
        });

        // Verify error response structure
        assert.strictEqual(result.isError, true);
        assert.ok(result.content[0].text.includes("HTTP 504"));
      } finally {
        global.fetch = originalFetch;
      }
    });

    it("should handle network errors with isError flag", async () => {
      // Mock fetch to simulate network error
      const originalFetch = global.fetch;
      global.fetch = async () => {
        throw new Error("Network connection failed");
      };

      try {
        const result = await toolHandler({
          request: {
            method: "GET",
            path: "/customer/list",
          }
        });

        // Verify error is properly handled
        assert.strictEqual(result.isError, true);
        assert.ok(result.content[0].text.includes("Unable to make request"));
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
  describe("Missing API Key Validation", () => {
    let server: McpServer;
    let originalExit: typeof process.exit;
    let exitCode: number | undefined;
    let consoleErrors: string[] = [];
    let originalConsoleError: typeof console.error;

    beforeEach(() => {
      // Mock process.exit to capture exit calls
      exitCode = undefined;
      originalExit = process.exit;
      process.exit = ((code?: number) => {
        exitCode = code || 0;
        throw new Error(`Process would exit with code ${exitCode}`);
      }) as any;

      // Mock console.error to capture error messages
      consoleErrors = [];
      originalConsoleError = console.error;
      console.error = (...args: any[]) => {
        consoleErrors.push(args.join(' '));
      };

      server = {
        registerTool: (name: string, config: any, handler: any) => { }
      } as any;
    });

    afterEach(() => {
      process.exit = originalExit;
      console.error = originalConsoleError;
      delete process.env.PAYSTACK_TEST_SECRET_KEY;
    });

    it("should fail when no API key provided via CLI or environment", () => {
      // Ensure no environment variable is set
      delete process.env.PAYSTACK_TEST_SECRET_KEY;

      try {
        registerMakePaystackRequestTool(server); // No cliApiKey parameter
        assert.fail("Expected registerMakePaystackRequestTool to throw an error");
      } catch (error: any) {
        assert.ok(error.message.includes("Process would exit with code 1"));
        assert.strictEqual(exitCode, 1);
        assert.ok(consoleErrors.some(msg => msg.includes("PAYSTACK_TEST_SECRET_KEY is required")));
      }
    });
  });
});
