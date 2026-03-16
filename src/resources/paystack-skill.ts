import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as fs from "node:fs";
import * as path from "node:path";

// Load skill content from external markdown file
let SKILL_CONTENT: string;
try {
  const skillPath = path.join(__dirname, "..", "data", "paystack-skill.md");
  SKILL_CONTENT = fs.readFileSync(skillPath, "utf-8");
} catch (error) {
  console.error("Error loading paystack-skill.md:", error);
  SKILL_CONTENT = "# Paystack Developer Knowledge\n\nError: Could not load skill content from file.";
}

export function registerSkillResource(server: McpServer) {
  server.registerResource(
    "paystack_skill",
    "paystack://skill",
    {
      description:
        "Paystack developer knowledge: docs index pointer, code snippet URL patterns, and payment channel reference",
      title: "Paystack Developer Knowledge",
      mimeType: "text/markdown",
    },
    async (uri) => {
      return {
        contents: [
          {
            uri: uri.href,
            text: SKILL_CONTENT,
            mimeType: "text/markdown",
          },
        ],
      };
    }
  );
}
