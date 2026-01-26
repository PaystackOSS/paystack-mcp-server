import { PaystackResponse, PaystackError } from "./types";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co';
const USER_AGENT = process.env.USER_AGENT || 'Paystack-MCP-Client';

class PaystackClient {
  private baseUrl: string;
  private secretKey: string;
  private userAgent: string;
  private timeout: number;

  constructor(
    secretKey: string,
    baseUrl: string = PAYSTACK_BASE_URL,
    userAgent: string = USER_AGENT,
    timeout: number = 30000
  ) {
    if (!secretKey) {
      throw new Error("Paystack secret key is required");
    }

    this.secretKey = secretKey;
    this.baseUrl = baseUrl;
    this.userAgent = userAgent;
    this.timeout = timeout;
  }

  /**
   * Make an HTTP request to Paystack API
   * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
   * @param endpoint - API endpoint path
   * @param data - Request body for POST/PUT/PATCH or query params for GET
   */

  async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<PaystackResponse<T>> {

    let url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.secretKey}`,
      'User-Agent': this.userAgent,
      'Accept': 'application/json',
    };

    const options: RequestInit = {
      method: method.toUpperCase()
    };

    // Add Content-Type and body for requests with data
    if (data && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
    options.headers = headers;

    try {
      const response = await fetch(url, options);

      // Parse response
      const responseText = await response.text();
      let responseData: PaystackResponse<T> | PaystackError;

      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
      return responseData as PaystackResponse<T>;
    } catch (error) {

      if (error !== null && (error as any).name === 'NetworkError') {
        const timeoutError = new Error(`Request timeout after ${this.timeout} ms`);
        (timeoutError as any).statusCode = 408;
        throw timeoutError;
      }
      throw error;
    }

  }
}
export const paystackClient = new PaystackClient(
  process.env.PAYSTACK_TEST_SECRET_KEY!
);