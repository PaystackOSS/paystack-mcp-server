import { config } from './config.js';
// Define log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Map log levels to numeric values for comparison
const logLevelValues: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

// Sensitive field patterns to redact
const SENSITIVE_PATTERNS = [
  /authorization/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /bearer/i,
  /credential/i,
  /secret[_-]?key/i,
  /cvv/i,
  /number/i,
];
/**
 * Redact sensitive fields in card objects
 * Only redacts cvv and number, keeps other fields visible
 */
function redactCardObject(card: any): any {
  if (Array.isArray(card)) {
    return card.map(redactCardObject);
  }
  
  if (typeof card === 'object' && card !== null) {
    const redactedCard: any = {};
    for (const [key, value] of Object.entries(card)) {
      // Only redact cvv and number fields in card object
      if (key === 'cvv' || key === 'number') {
        redactedCard[key] = '[REDACTED]';
      } else {
        // Keep other card fields but recursively redact if they're objects
        redactedCard[key] = redactSensitiveData(value);
      }
    }
    return redactedCard;
  }
  
  return card;
}


function redactSensitiveData(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Redact bearer tokens and API keys in strings
    return obj.replace(/Bearer\s+\w+/gi, 'Bearer [REDACTED]')
              .replace(/sk_test_\w+/g, '[REDACTED_SECRET_KEY]')
              .replace(/pk_test_\w+/g, '[REDACTED_PUBLIC_KEY]');
  }

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveData);
  }

  if (typeof obj === 'object') {
    const redacted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Special handling for card objects - only redact cvv and number
      if (key.toLowerCase() === 'card' && typeof value === 'object' && value !== null) {
        redacted[key] = redactCardObject(value);
      } 
      // Check if key matches sensitive patterns
      else if (SENSITIVE_PATTERNS.some(pattern => pattern.test(key))) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactSensitiveData(value);
      }
    }
    return redacted;
  }

  return obj;
}

class Logger {
  private currentLogLevel: LogLevel;

  constructor() {
    this.currentLogLevel = config.LOG_LEVEL as LogLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return logLevelValues[level] >= logLevelValues[this.currentLogLevel];
  }

  private formatLog(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(meta && { meta: redactSensitiveData(meta) }),
    };

    return JSON.stringify(logEntry);
  }

  debug(message: string, meta?: any) {
    // Disabled for MCP stdio communication
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.error(this.formatLog(LogLevel.DEBUG, message, meta));
    }
  }

  info(message: string, meta?: any) {
    // Disabled for MCP stdio communication
    if (this.shouldLog(LogLevel.INFO)) {
      console.error(this.formatLog(LogLevel.INFO, message, meta));
    }
  }

  warn(message: string, meta?: any) {
    // Disabled for MCP stdio communication
    if (this.shouldLog(LogLevel.WARN)) {
      console.error(this.formatLog(LogLevel.WARN, message, meta));
    }
  }

  error(message: string, meta?: any) {
    // Disabled for MCP stdio communication
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatLog(LogLevel.ERROR, message, meta));
    }
  }

  /**
   * Log API request
   */
  logRequest(method: string, url: string, data?: any, headers?: any) {
    this.debug('API Request', {
      method,
      url,
      data,
      headers,
    });
  }

  /**
   * Log API response
   */
  logResponse(method: string, url: string, status: number, data?: any) {
    this.debug('API Response', {
      method,
      url,
      status,
      data,
    });
  }

  /**
   * Log tool call
   */
  logToolCall(toolName: string, params?: any) {
    this.info('Tool called', {
      tool: toolName,
      params,
    });
  }
}

export const logger = new Logger();
