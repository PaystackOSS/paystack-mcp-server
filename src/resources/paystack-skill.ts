import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerSkillResource(server: McpServer, skillContent: string) {
  server.registerResource(
    'paystack_skill',
    'paystack://skill',
    {
      description:
        'Paystack developer knowledge: docs index pointer, code snippet URL patterns, and payment channel reference',
      title: 'Paystack Developer Knowledge',
      mimeType: 'text/markdown',
    },
    async (uri) => {
      return {
        contents: [
          {
            uri: uri.href,
            text: skillContent,
            mimeType: 'text/markdown',
          },
        ],
      };
    },
  );
}
