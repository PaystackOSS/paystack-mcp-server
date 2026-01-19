import type { PaystackResponse, PaystackError } from "./types.js";

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
  
  async get<T = any>(endpoint: string, params?: Record<string, string | number>): Promise<PaystackResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params as Record<string, string>)}` : endpoint;
    return this.makeRequest<T>('GET', url);
  }

  async post<T = any>(endpoint: string, data?: any): Promise<PaystackResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, data);
  }

  private async makeRequest<T>(
    method: string, 
    endpoint: string, 
    data?: any
  ): Promise<PaystackResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.secretKey}`,
      'User-Agent': this.userAgent,
      'Accept': 'application/json',
    };

    const config: RequestInit = {
      method: method.toUpperCase(),
      headers: headers
    };

    // Add Content-Type and body for requests with data
    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      
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
  process.env.PAYSTACK_SECRET_KEY!
);