import { ToolDefinition } from './types.js';
import { paystackClient } from '../paystack-client.js';
import { logger } from '../logger.js';

/**
 * List Paystack transactions with filtering and pagination
 */
export const listTransactions: ToolDefinition = {
  definition: {
    name: 'list_transactions',
    description: 'List all transactions from Paystack. Supports pagination and filtering by status. Returns an array of transactions with details.',
    inputSchema: {
      type: 'object',
      properties: {
        perPage: {
          type: 'number',
          description: 'Number of transactions per page (default: 50, max: 100)',
          minimum: 1,
          maximum: 100,
        },
        page: {
          type: 'number',
          description: 'Page number to retrieve (default: 1)',
          minimum: 1,
        },
        status: {
          type: 'string',
          description: 'Filter by transaction status',
          enum: ['success', 'failed', 'abandoned'],
        },
      },
    },
  },

  handler: async (args) => {
    const params: Record<string, any> = {};
    
    if (args.perPage) params.perPage = args.perPage;
    if (args.page) params.page = args.page;
    if (args.status) params.status = args.status;

    logger.info('Listing transactions', { params });

    const response = await paystackClient.makeRequest<any>('GET', '/transaction', params);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  },
};
