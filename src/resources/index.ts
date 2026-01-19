import { ResourceDefinition } from './types.js';
import { listTransactionsResource } from './list-transactions.js';

/**
 * Registry of all available resources
 * 
 * Each resource includes:
 * - definition: MCP resource schema (uri, name, description, mimeType)
 * - handler: async function that fetches the resource content
 */
export const RESOURCES: ResourceDefinition[] = [
  listTransactionsResource,
];

/**
 * Get resource handler by URI pattern
 */
export function getResourceHandler(uri: string): ResourceDefinition['handler'] | undefined {
  
  const resource = RESOURCES.find(r => {
    // Convert URI template to regex pattern    
    // Step 1: Replace {params} with capture groups FIRST
    let pattern = r.definition.uri.replace(/\{[^}]+\}/g, '(.+)');
    
  
    pattern = pattern
      .replace(/\\/g, '\\\\')  // Escape backslashes first
      .replace(/\./g, '\\.')   // Escape dots
      .replace(/\*/g, '\\*')   // Escape asterisks
      .replace(/\+/g, '\\+')   // Escape plus (but not in (.+) since we replace carefully)
      .replace(/\?/g, '\\?')   // Escape question marks
      .replace(/\^/g, '\\^')   // Escape carets
      .replace(/\$/g, '\\$')   // Escape dollar signs
      .replace(/\|/g, '\\|')   // Escape pipes
      .replace(/\[/g, '\\[')   // Escape square brackets
      .replace(/\]/g, '\\]')   // Escape square brackets
      .replace(/:/g, '\\:')    // Escape colons (from paystack:// scheme)
      .replace(/\//g, '\\/');  // Escape forward slashes
    
    pattern = pattern.replace(/\\\(\\\.\\\+\\\)/g, '(.+)');
    
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(uri);
  });

  return resource?.handler;
}

/**
 * Get all resource definitions (schemas only, for ListResources)
 */
export function getResourceDefinitions() {
  return RESOURCES.map(r => r.definition);
}