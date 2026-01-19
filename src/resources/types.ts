import { Resource, ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Resource content result
 * Using the MCP SDK's ReadResourceResult type
 */
export type ResourceContent = ReadResourceResult;

/**
 * Resource handler function signature
 */
export type ResourceHandler = (uri: URL) => Promise<ResourceContent>;

/**
 * Complete resource definition including schema and handler
 */
export interface ResourceDefinition {
  /** Resource metadata for MCP protocol */
  definition: Resource;
  /** Handler function that fetches the resource */
  handler: ResourceHandler;
}