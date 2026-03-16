import assert from "node:assert";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSkillResource } from "../src/resources/paystack-skill.js";

describe("PaystackSkillResource", () => {
  let resourceHandler: any;
  let registeredName: string;
  let registeredUri: string;
  let registeredMetadata: any;

  before(() => {
    const server = {
      registerResource: (name: string, uri: string, metadata: any, handler: any) => {
        registeredName = name;
        registeredUri = uri;
        registeredMetadata = metadata;
        resourceHandler = handler;
      }
    } as any;

    registerSkillResource(server);
  });

  describe("Registration", () => {
    it("should register with the correct name", () => {
      assert.strictEqual(registeredName, "paystack_skill");
    });

    it("should register with the correct URI", () => {
      assert.strictEqual(registeredUri, "paystack://skill");
    });

    it("should set mimeType to text/markdown", () => {
      assert.strictEqual(registeredMetadata.mimeType, "text/markdown");
    });

    it("should have a description", () => {
      assert.ok(registeredMetadata.description);
      assert.ok(registeredMetadata.description.length > 0);
    });
  });

  describe("Content", () => {
    let content: string;

    before(async () => {
      const mockUri = new URL("paystack://skill");
      const result = await resourceHandler(mockUri);
      content = result.contents[0].text;
    });

    it("should return text/markdown mimeType in response", async () => {
      const mockUri = new URL("paystack://skill");
      const result = await resourceHandler(mockUri);
      assert.strictEqual(result.contents[0].mimeType, "text/markdown");
    });

    it("should include documentation index section", () => {
      assert.ok(content.includes("## Documentation Index"));
    });

    it("should include code snippets section", () => {
      assert.ok(content.includes("## Code Snippets"));
    });

    it("should include payment channels by country section", () => {
      assert.ok(content.includes("## Payment Channels by Country"));
    });

    it("should include links to Paystack docs", () => {
      assert.ok(content.includes("https://paystack.com/docs/llms.txt"));
    });

    it("should include snippet repo URL pattern for JS", () => {
      assert.ok(content.includes("PaystackOSS/doc-code-snippets"));
      assert.ok(content.includes("index.js"));
    });

    it("should include snippet repo URL pattern for Shell", () => {
      assert.ok(content.includes("index.sh"));
    });

    it("should include all supported countries", () => {
      assert.ok(content.includes("Nigeria"));
      assert.ok(content.includes("Ghana"));
      assert.ok(content.includes("South Africa"));
      assert.ok(content.includes("Kenya"));
      assert.ok(content.includes("Côte d'Ivoire"));
    });
  });
});

describe("ServerInstructions", () => {
  it("should pass instructions to the McpServer constructor", async () => {
    // Dynamically import server module to verify instructions are set
    // We check the source directly since McpServer options are private
    const fs = await import("node:fs");
    const path = await import("node:path");
    const serverSource = fs.readFileSync(
      path.join(__dirname, "../src/server.ts"),
      "utf-8"
    );

    assert.ok(
      serverSource.includes("instructions:"),
      "server.ts should pass instructions to McpServer"
    );
    assert.ok(
      serverSource.includes("smallest currency unit"),
      "instructions should include currency unit rule"
    );
    assert.ok(
      serverSource.includes("get_paystack_operation"),
      "instructions should reference the operation tool"
    );
    assert.ok(
      serverSource.includes("do not invent"),
      "instructions should include anti-hallucination directive"
    );
  });
});
