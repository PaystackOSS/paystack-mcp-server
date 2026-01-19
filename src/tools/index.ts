/**
 * Tool Registry
 * 
 * This module exports all available MCP tools.
 * 
 * To add a new tool:
 * 1. Create a new file in src/tools/ (e.g., my-tool.ts)
 * 2. Export a ToolDefinition with 'definition' and 'handler'
 * 3. Import and add it to the TOOLS array below
 */

import { ToolDefinition } from './types.js';
import { listTransactions } from './list-transactions.js';


/**
 * Registry of all available tools
 * 
 * Each tool includes:
 * - definition: MCP tool schema (name, description, inputSchema)
 * - handler: async function that executes the tool logic
 */
export const TOOLS: ToolDefinition[] = [listTransactions];

/**
 * Get tool handler by name
 */
export function getToolHandler(name: string): ToolDefinition['handler'] | undefined {
  const tool = TOOLS.find(t => t.definition.name === name);
  return tool?.handler;
}

/**
 * Get all tool definitions (schemas only, for ListTools)
 */
export function getToolDefinitions() {
  return TOOLS.map(t => t.definition);
}
