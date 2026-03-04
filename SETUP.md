# Editor Setup

Configure the Paystack MCP Server in supported editors with secure `.env`-based API key management.

- [Environment Setup](#environment-setup)
- [VS Code](#vs-code)
- [Cursor](#cursor)
- [Claude Desktop](#claude-desktop)

---

## Environment Setup

Create your environment file:

1. **Copy the example file:**

   ```bash
   cp .env.example .env
   ```

2. **Add your Paystack test secret key:**

   ```env
   PAYSTACK_TEST_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

> [!IMPORTANT]
> - Only **test keys** (starting with `sk_test_`) are accepted. The server rejects live keys.
> - The `.env` file is already in `.gitignore`—never commit it to version control.

---

## VS Code

VS Code supports the `envFile` property, allowing you to load environment variables from a file instead of hardcoding them.

### Configuration

Create or update `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "paystack": {
      "command": "node",
      "args": ["/path/to/paystack-mcp/build/index.js"],
      "envFile": "${workspaceFolder}/.env"
    }
  }
}
```

> [!NOTE]
> Replace `/path/to/paystack-mcp` with the actual path to your cloned repository.

### Reload the MCP Server

After saving the configuration, reload VS Code or run the **"MCP: Restart Server"** command from the Command Palette.

---

## Cursor

Cursor supports both `envFile` and environment variable interpolation via `${env:VAR_NAME}`.

### Configuration Locations

| Scope   | File Path                |
| ------- | ------------------------ |
| Project | `.cursor/mcp.json`       |
| Global  | `~/.cursor/mcp.json`     |

### Using `envFile` (Recommended)

Create `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "paystack": {
      "command": "node",
      "args": ["/path/to/paystack-mcp/build/index.js"],
      "envFile": "${workspaceFolder}/.env"
    }
  }
}
```

---

## Claude Desktop

Claude Desktop uses an inline `env` object for environment variables. It does not support `envFile`.

### Configuration Location

| OS      | File Path                                                    |
| ------- | ------------------------------------------------------------ |
| macOS   | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json`                |

### Approach A: Inline Environment Variables (Simple)

Edit your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "paystack": {
      "command": "node",
      "args": ["/path/to/paystack-mcp/build/index.js"],
      "env": {
        "PAYSTACK_SECRET_KEY": "sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

> [!WARNING]
> This approach stores your API key directly in the config file. Ensure this file is not shared or committed to version control.

### Approach B: Using a Wrapper Script (Secure)

For better security, create a shell script that loads your `.env` file before starting the server.

1. **Create a wrapper script** (e.g., `run-paystack-mcp.sh`):

   ```bash
   #!/bin/bash
   set -a
   source /path/to/paystack-mcp/.env
   set +a
   exec node /path/to/paystack-mcp/build/index.js
   ```

2. **Make it executable:**

   ```bash
   chmod +x /path/to/run-paystack-mcp.sh
   ```

3. **Update your Claude Desktop config:**

   ```json
   {
     "mcpServers": {
       "paystack": {
         "command": "/path/to/run-paystack-mcp.sh"
       }
     }
   }
   ```

---

## Troubleshooting

### Server not starting

- Verify Node.js v18+ is installed: `node --version`
- Check the path to `build/index.js` is correct
- Ensure your `.env` file exists and contains a valid `sk_test_*` key

### Environment variables not loading

- For VS Code/Cursor: Confirm `envFile` path is correct and the file exists
- For Claude Desktop: Restart the application after config changes

### "Invalid API key" errors

- Ensure your key starts with `sk_test_` (live will be rejected)
- Check for trailing whitespace in your `.env` file
