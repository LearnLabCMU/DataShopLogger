export default class DataShopLoggerError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = 'DataShopLoggerError';
    this.code = code;
    this.details = details;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DataShopLoggerError);
    }
  }
}

export class ConfigurationError extends DataShopLoggerError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
  }
}

export class NetworkError extends DataShopLoggerError {
  constructor(message: string, details?: unknown) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends DataShopLoggerError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}