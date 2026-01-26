export interface PaystackResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
  meta?: {
    next?: string;
    previous?: string;
    perPage?: number;
    page?: number;
    pageCount?: number;
    total?: number;
  };
}

export interface PaystackError {
  status: boolean;
  message: string;
  meta?: {
    nextStep?: string;
  },
  type?: string;
  code?: string;
}