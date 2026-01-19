import { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Tool execution result
 * Using the MCP SDK's CallToolResult type
 */
export type ToolResult = CallToolResult;

/**
 * Tool handler function signature
 */
export type ToolHandler = (args: any) => Promise<ToolResult>;

/**
 * Complete tool definition including schema and handler
 */
export interface ToolDefinition {
  /** Tool metadata for MCP protocol */
  definition: Tool;
  /** Handler function that executes the tool */
  handler: ToolHandler;
}
