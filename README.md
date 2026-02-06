# Paystack MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that enables AI assistants to interact with the full range of [Paystack APIs](https://paystack.com/docs/api/).

> [!WARNING]
> **Public Preview:** This MCP server is currently in public preview. We're seeking early feedback to improve the next iteration, so use cautiously and report any issues you encounter.

## Quick Start

Clone the repo and build locally:

```bash
git clone https://github.com/PaystackOSS/paystack-mcp-server.git
cd paystack-mcp-server
npm install
npm run build
```

Then configure your MCP client to use the built server (see [Client Integration](#client-integration)).

## Requirements

- Node.js v18+
- npm or yarn
- A Paystack test secret key (starts with `sk_test_`)

## Configuration Options

| Environment Variable       | Purpose                                                |
| -------------------------- | ------------------------------------------------------ | 
| `PAYSTACK_TEST_SECRET_KEY` | Your Paystack test secret key **(required)**           |

> **Security note:** Only test keys (`sk_test_*`) are allowed. The server validates this at startup and will reject live keys.

## Client Integration

The Paystack MCP Server works with any MCP-compatible client. Below is the standard configuration schema used by most clients (Claude Desktop, ChatGPT Desktop, Cursor, Windsurf, etc.).

### Using a local build

If you've cloned and built the server locally:

```json
{
  "mcpServers": {
    "paystack": {
      "command": "node",
      "args": ["/path/to/paystack-mcp-server/build/index.js"],
      "env": {
        "PAYSTACK_TEST_SECRET_KEY": "sk_test_..."
      }
    }
  }
}
```

> [!IMPORTANT]
> When setting `command: "node"`, you should ensure you're using Node v18+. If you are using a package manager, you might need to get the path of your Node binary by running this command in your CLI:
>
> ### Linux and MacOS
>
> ```sh
> which node
> ```
>
> ### Windows
>
> ```sh
> where node
> ```
>
> Once you have the path, use it as the value of the MCP Server command in the JSON configuration. e.g., `command: "path/to/installation/bin/node"`

### Where to add this configuration

| Client          | Config file location                              |
| --------------- | ------------------------------------------------- |
| VS Code         | `.vscode/mcp.json`                                |
| Claude Desktop  | `claude_desktop_config.json`                      |
| ChatGPT Desktop | MCP settings in app preferences                   |
| Cursor          | `.cursor/mcp.json` or global MCP settings         |
| Windsurf        | MCP configuration in settings                     |
| Claude Code     | `~/.claude/mcp.json` or project-level `.mcp.json` |

## How It Works

The Paystack MCP Server exposes the **entire Paystack API** to AI assistants by parsing Paystack's OpenAPI specification at runtime. Instead of hardcoding individual endpoints, the server dynamically discovers all available operations and makes them accessible through a small set of tools.

### Available Tools

| Tool                     | Description                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| `get_paystack_operation` | Fetch operation details (method, path, parameters) by operation ID |
| `get_paystack_operation_guided` | Infers the operation ID from prompt |
| `make_paystack_request`  | Execute a Paystack API request                                     |

### Available Resources

| Resource                  | URI                          | Description                                              |
| ------------------------- | ---------------------------- | -------------------------------------------------------- |
| `paystack_operation_list` | `paystack://operations/list` | List all available Paystack operations and their details |

### Example

When you ask your AI assistant something like _"Get me the last 5 transactions on my Paystact integration"_, here's what happens behind the scenes:

1. The assistant calls `get_paystack_operation("transaction_list")` to look up the endpoint details
2. It gets back the method (`GET`), path (`/transaction`), and available query parameters
3. It then calls `make_paystack_request` with `{ method: "GET", path: "/transaction", data: { perPage: 5 } }`
4. You get your transactions

### Prompt recommendation

To get the best results when using this MCP server, be specific in your prompts and always include "Paystack" in your requests. This helps the LLM quickly identify and use the appropriate Paystack tools.

**Good prompts:**
- "Initialize a Paystack transaction for 50000 NGN"
- "Create a customer with email user@example.com on my Paystack account"
- "How can I send money with the Paystack API?"

**Less effective prompts:**
- "List my transactions" (unclear which service to use)
- "Charge a customer" (missing context about Paystack)

Being explicit ensures the LLM narrows down to the right tool quickly and reduces ambiguity.

## Development

### Run locally (without building)

For local development and testing, you can run the TypeScript source directly:

```bash
PAYSTACK_TEST_SECRET_KEY=sk_test_... npm run dev
```

### Run with MCP Inspector

```bash
npm run inspect
```

### Build

```bash
npm run build
```

### Run tests

```bash
npm test
```

## Troubleshooting

| Issue                            | Solution                                                           |
| -------------------------------- | ------------------------------------------------------------------ |
| Server exits silently at startup | Check that `PAYSTACK_TEST_SECRET_KEY` is set                       |
| "Invalid key" error              | Key must start with `sk_test_` — live keys are not allowed         |
| Tools not appearing in client    | Ensure the server is running and the client config path is correct |
| Request timeouts                 | Check network connectivity to `api.paystack.co`                    |

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## License

MIT
