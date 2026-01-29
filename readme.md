# Paystack MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that enables AI assistants to interact with the full range of [Paystack APIs](https://paystack.com/docs/api/).

## Quick Start

<!-- TODO: Update once published to npm -->
```bash
# Via npx (coming soon)
npx paystack-mcp start

# With environment configuration
PAYSTACK_SECRET_KEY_TEST=sk_test_... npx paystack-mcp start
```

For now, clone and build locally:

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

| Environment Variable | Purpose | Default |
| --- | --- | --- |
| `PAYSTACK_SECRET_KEY_TEST` | Your Paystack test secret key **(required)** | — |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` |
| `LOG_LEVEL` | Logging verbosity (`debug`, `info`, `warn`, `error`) | `info` |

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
        "PAYSTACK_SECRET_KEY_TEST": "sk_test_..."
      }
    }
  }
}
```

### Using npm (coming soon)

<!-- TODO: Update once published -->
```json
{
  "mcpServers": {
    "paystack": {
      "command": "npx",
      "args": ["paystack-mcp", "start"],
      "env": {
        "PAYSTACK_SECRET_KEY_TEST": "sk_test_..."
      }
    }
  }
}
```

### Where to add this configuration

| Client | Config file location |
| --- | --- |
| Claude Desktop | `claude_desktop_config.json` |
| ChatGPT Desktop | MCP settings in app preferences |
| Cursor | `.cursor/mcp.json` or global MCP settings |
| Windsurf | MCP configuration in settings |
| Claude Code | `~/.claude/mcp.json` or project-level `.mcp.json` |

## How It Works

The Paystack MCP Server exposes the **entire Paystack API** to AI assistants by parsing Paystack's OpenAPI specification at runtime. Instead of hardcoding individual endpoints, the server dynamically discovers all available operations and makes them accessible through a small set of tools.

### Available Tools

| Tool | Description |
| --- | --- |
| `get_paystack_operation` | Fetch operation details (method, path, parameters) by operation ID |
| `make_paystack_request` | Execute a Paystack API request |

### Available Resources

| Resource | Description |
| --- | --- |
| `openapi://operations/list` | List all available Paystack operation IDs |

### Example

When you ask your AI assistant something like *"Get me the last 5 transactions"*, here's what happens behind the scenes:

1. The assistant calls `get_paystack_operation("transaction_list")` to look up the endpoint details
2. It gets back the method (`GET`), path (`/transaction`), and available query parameters
3. It then calls `make_paystack_request` with `{ method: "GET", path: "/transaction", data: { perPage: 5 } }`
4. You get your transactions

## Development

### Run locally (without building)

For local development and testing, you can run the TypeScript source directly:

```bash
PAYSTACK_SECRET_KEY_TEST=sk_test_... npm run dev
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

| Issue | Solution |
| --- | --- |
| Server exits silently at startup | Check that `PAYSTACK_SECRET_KEY_TEST` is set (not `PAYSTACK_TEST_SECRET_KEY`) |
| "Invalid key" error | Key must start with `sk_test_` — live keys are not allowed |
| Tools not appearing in client | Ensure the server is running and the client config path is correct |
| Request timeouts | Check network connectivity to `api.paystack.co` |

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

See [contributing.md](contributing.md) for more details.

## License

MIT
