import DataShopLoggerError, { 
  ConfigurationError, 
  NetworkError, 
  ValidationError 
} from '../errors/DataShopLoggerError';

describe('DataShopLoggerError', () => {
  describe('DataShopLoggerError base class', () => {
    it('should create error with message and code', () => {
      const error = new DataShopLoggerError('Test error', 'TEST_ERROR');
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('DataShopLoggerError');
      expect(error.details).toBeUndefined();
    });

    it('should create error with details', () => {
      const details = { field: 'test', value: 123 };
      const error = new DataShopLoggerError('Test error', 'TEST_ERROR', details);
      
      expect(error.details).toEqual(details);
    });

    it('should be instanceof Error', () => {
      const error = new DataShopLoggerError('Test error', 'TEST_ERROR');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DataShopLoggerError);
    });

    it('should have stack trace', () => {
      const error = new DataShopLoggerError('Test error', 'TEST_ERROR');
      
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('DataShopLoggerError');
    });
  });

  describe('ConfigurationError', () => {
    it('should create configuration error', () => {
      const error = new ConfigurationError('Invalid configuration');
      
      expect(error.message).toBe('Invalid configuration');
      expect(error.code).toBe('CONFIGURATION_ERROR');
      expect(error.name).toBe('ConfigurationError');
    });

    it('should be instanceof appropriate classes', () => {
      const error = new ConfigurationError('Invalid configuration');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DataShopLoggerError);
      expect(error).toBeInstanceOf(ConfigurationError);
    });

    it('should include details', () => {
      const details = { missingField: 'log_service_url' };
      const error = new ConfigurationError('Missing required field', details);
      
      expect(error.details).toEqual(details);
    });
  });

  describe('NetworkError', () => {
    it('should create network error', () => {
      const error = new NetworkError('Connection failed');
      
      expect(error.message).toBe('Connection failed');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.name).toBe('NetworkError');
    });

    it('should be instanceof appropriate classes', () => {
      const error = new NetworkError('Connection failed');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DataShopLoggerError);
      expect(error).toBeInstanceOf(NetworkError);
    });

    it('should include network details', () => {
      const details = { 
        url: 'https://example.com/log', 
        status: 500,
        statusText: 'Internal Server Error'
      };
      const error = new NetworkError('Server error', details);
      
      expect(error.details).toEqual(details);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
    });

    it('should be instanceof appropriate classes', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DataShopLoggerError);
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should include validation details', () => {
      const details = { 
        field: 'transactionID', 
        value: 'invalid-format',
        expectedFormat: 'T[UUID]'
      };
      const error = new ValidationError('Invalid transaction ID format', details);
      
      expect(error.details).toEqual(details);
    });
  });

  describe('Error throwing and catching', () => {
    it('should be catchable by type', () => {
      const throwConfigError = (): void => {
        throw new ConfigurationError('Test config error');
      };

      expect(() => {
        try {
          throwConfigError();
        } catch (error) {
          if (error instanceof ConfigurationError) {
            expect(error.code).toBe('CONFIGURATION_ERROR');
            throw error;
          }
        }
      }).toThrow(ConfigurationError);
    });

    it('should be catchable as DataShopLoggerError', () => {
      const errors = [
        new ConfigurationError('Config error'),
        new NetworkError('Network error'),
        new ValidationError('Validation error'),
      ];

      errors.forEach(error => {
        expect(() => {
          try {
            throw error;
          } catch (e) {
            if (e instanceof DataShopLoggerError) {
              expect(['CONFIGURATION_ERROR', 'NETWORK_ERROR', 'VALIDATION_ERROR']).toContain(e.code);
              throw e;
            }
          }
        }).toThrow(DataShopLoggerError);
      });
    });
  });
});