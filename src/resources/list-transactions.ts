import { ResourceDefinition } from './types.js';
import { paystackClient } from '../paystack-client.js';
import { logger } from '../logger.js';
import { config } from '../config.js';

export const listTransactionsResource: ResourceDefinition = {
  definition: {
    uri: 'paystack://transactions',
    name: 'Transactions List',
    description: 'Get a list of Paystack transactions. Supports filtering by status (success, failed, abandoned) and pagination. URI patterns: paystack://transactions, paystack://transactions/status/{status}, paystack://transactions/page/{page}',
    mimeType: 'application/json',
  },

  handler: async (uri: URL) => {
    try {

    
    // Convert URL to string for pattern matching
    const uriString = uri.toString();
    
    // Parse URI to extract optional filters
    const params: Record<string, any> = {
      perPage: 50,
    };

    // Extract status filter if present
    const statusMatch = uriString.match(/\/status\/(\w+)/);
    if (statusMatch) {
      params.status = statusMatch[1];
    }

    // Extract page number if present
    const pageMatch = uriString.match(/\/page\/(\d+)/);
    if (pageMatch) {
      params.page = parseInt(pageMatch[1], 10);
    }

    logger.info('Fetching transactions list resource', {
      uri: uriString,
      params,
      environment: config.NODE_ENV,
    });

    // Fetch transactions data using shared client
    const response = await paystackClient.makeRequest<any>('GET', '/transaction', params);

    const transactionCount = response.data?.data?.length || 0;
    
    logger.info('Transactions list resource fetched', {
      uri: uriString,
      count: transactionCount,
      status: params.status || 'all',
      page: params.page || 1,
    });

    // Return resource content
    return {
      contents: [
        {
          uri: uriString,
          mimeType: 'application/json',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        contents: [{
          uri: uri.toString(),
          mimeType: 'application/json',
          text: JSON.stringify({ error: errorMessage }, null, 2),
        }],
      };
    }
  },
};
