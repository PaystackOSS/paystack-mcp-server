import assert from "node:assert";
import { paystackClient } from "../src/paystack-client.js";

describe("PaystackClient", () => {
  describe("makeRequest - Non-JSON Response Handling", () => {
    it("should throw a descriptive error for HTML error responses", async () => {
      // This test validates that non-JSON responses (like HTML error pages)
      // are handled gracefully with proper error messages including status code
      
      // Mock fetch to return an HTML 502 Bad Gateway response
      const originalFetch = global.fetch;
      global.fetch = async () => {
        return {
          status: 502,
          text: async () => "<html><body><h1>502 Bad Gateway</h1></body></html>",
        } as Response;
      };

      try {
        await paystackClient.makeRequest("GET", "/test-endpoint");
        assert.fail("Expected makeRequest to throw an error");
      } catch (error: any) {
        // Verify error message includes status code and response snippet
        assert.ok(error.message.includes("Received non-JSON response from server"));
        assert.ok(error.message.includes("HTTP 502"));
        assert.ok(error.message.includes("<html>"));
        
        // Verify statusCode is attached to error
        assert.strictEqual(error.statusCode, 502);
        
        // Verify full responseText is available for debugging
        assert.ok(error.responseText);
        assert.ok(error.responseText.includes("502 Bad Gateway"));
      } finally {
        global.fetch = originalFetch;
      }
    });

    it("should truncate long non-JSON responses to 200 characters", async () => {
      const originalFetch = global.fetch;
      const longHtmlResponse = "<html>" + "x".repeat(300) + "</html>";
      
      global.fetch = async () => {
        return {
          status: 500,
          text: async () => longHtmlResponse,
        } as Response;
      };

      try {
        await paystackClient.makeRequest("GET", "/test-endpoint");
        assert.fail("Expected makeRequest to throw an error");
      } catch (error: any) {
        // Verify the error message contains truncated snippet (200 chars + '...')
        const snippetMatch = error.message.match(/: (.+)$/);
        assert.ok(snippetMatch);
        const snippet = snippetMatch[1];
        
        // Should end with '...' for truncation
        assert.ok(snippet.endsWith('...'));
        
        // Should be 203 characters (200 + '...')
        assert.ok(snippet.length <= 203);
        
        // Full response should still be available
        assert.strictEqual(error.responseText, longHtmlResponse);
      } finally {
        global.fetch = originalFetch;
      }
    });

    it("should not truncate short non-JSON responses", async () => {
      const originalFetch = global.fetch;
      const shortResponse = "Gateway Timeout";
      
      global.fetch = async () => {
        return {
          status: 504,
          text: async () => shortResponse,
        } as Response;
      };

      try {
        await paystackClient.makeRequest("GET", "/test-endpoint");
        assert.fail("Expected makeRequest to throw an error");
      } catch (error: any) {
        // Verify the error message contains full short response
        assert.ok(error.message.includes(shortResponse));
        assert.ok(!error.message.includes('...'));
        assert.strictEqual(error.statusCode, 504);
      } finally {
        global.fetch = originalFetch;
      }
    });

    it("should successfully parse valid JSON responses", async () => {
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
        const response = await paystackClient.makeRequest("GET", "/test-endpoint");
        assert.strictEqual(response.status, true);
        assert.strictEqual(response.message, "Success");
        assert.deepStrictEqual(response.data, { id: 123 });
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});
