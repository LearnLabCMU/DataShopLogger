import { DataShopLogger } from '../DataShopLogger';
import type { LogConfiguration } from '../types';

describe('DataShopLogger - Additional Coverage', () => {
  let logger: DataShopLogger;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    // Test fetch fallback when sendBeacon is not available
    delete (global as any).navigator;
    mockFetch = jest.fn().mockResolvedValue({ 
      ok: true,
      text: jest.fn().mockResolvedValue('OK')
    });
    global.fetch = mockFetch;
    
    const config: LogConfiguration = {
      log_service_url: 'https://test.example.com/log',
      dataset_name: 'TestDataset',
    };
    
    logger = new DataShopLogger({ configuration: config });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetch fallback', () => {
    it('should use fetch when sendBeacon is not available', () => {
      logger.logInterfaceAttempt('button', 'click', 'submit');
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.example.com/log',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('%3Ctool_message'), // URL-encoded <tool_message
          headers: {
            'Content-Type': 'text/plain',
          },
          keepalive: true,
        })
      );
    });

    it('should handle fetch errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      logger.logInterfaceAttempt('button', 'click', 'submit');
      
      // Wait for the promise to reject
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to send log message:',
        expect.any(Error)
      );
      
      consoleError.mockRestore();
    });
  });

  describe('additional setters', () => {
    it('should set and use various configuration properties', () => {
      logger.setUserID({ id: 'custom-user-123' });
      logger.setProblemName({ name: 'CustomProblem' });
      logger.setProblemContext({ context: 'Custom context' });
      logger.setDatasetName({ name: 'CustomDataset' });
      logger.setSchool({ school: 'CustomSchool' });
      logger.setPeriod({ period: 'CustomPeriod' });
      logger.setInstructor({ instructor: 'CustomInstructor' });
      logger.setDescription({ description: 'Custom description' });
      
      // Start to trigger context message
      logger.start();
      
      const contextMessage = mockFetch.mock.calls[1][1].body;
      // Check for URL-encoded values
      expect(contextMessage).toContain('custom-user-123');
      expect(contextMessage).toContain('CustomProblem');
      expect(contextMessage).toContain(encodeURIComponent('Custom context'));
      expect(contextMessage).toContain('CustomDataset');
      
      // Note: School, Period, Instructor, and Description are only included
      // when class_name is set, so we need to set that first
      logger.setLogClassName({ className: 'TestClass' });
      
      // Clear previous calls and start again
      mockFetch.mockClear();
      logger.start();
      
      const updatedContextMessage = mockFetch.mock.calls[1][1].body;
      expect(updatedContextMessage).toContain('TestClass');
      expect(updatedContextMessage).toContain('CustomSchool');
      expect(updatedContextMessage).toContain('CustomPeriod');
      expect(updatedContextMessage).toContain('CustomInstructor');
      expect(updatedContextMessage).toContain(encodeURIComponent('Custom description'));
    });
  });

  describe('endSession()', () => {
    it('should generate new session ID', () => {
      const firstSession = logger.start();
      logger.endSession();
      const secondSession = logger.start();
      
      expect(firstSession).not.toBe(secondSession);
      expect(secondSession).toMatch(/^ctat_session_[0-9a-f-]+$/);
    });
  });

  describe('log listener', () => {
    it('should set and use log listener', () => {
      const listener = jest.fn();
      logger.setLogListener({ listener });
      
      logger.logInterfaceAttempt('button', 'click', 'submit');
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(expect.stringContaining('<?xml')); // Wrapped message starts with XML declaration
    });
  });

  describe('logResponseSAI with last transaction ID', () => {
    it('should use last transaction ID when none provided', () => {
      // First log an attempt to set lastTransactionID
      const txId = logger.logInterfaceAttempt('button', 'click', 'submit');
      
      // Clear fetch calls
      mockFetch.mockClear();
      
      // Log response without transaction ID
      logger.logResponseSAI(
        '', // empty transaction ID
        { selection: 'button', action: 'click', input: 'submit' },
        'RESULT',
        'CORRECT',
        'Good job!'
      );
      
      const message = mockFetch.mock.calls[0][1].body;
      // Check for URL-encoded transaction ID
      expect(message).toContain(encodeURIComponent(`transaction_id="${txId}"`));
    });
  });

  describe('no environment support', () => {
    it('should throw error when neither sendBeacon nor fetch is available', () => {
      delete (global as any).fetch;
      
      const noEnvLogger = new DataShopLogger({
        configuration: { log_service_url: 'https://test.com' }
      });
      
      expect(() => {
        noEnvLogger.logInterfaceAttempt('test', 'test', 'test');
      }).toThrow('No suitable method for sending log messages');
    });
  });

  describe('options handling', () => {
    it('should handle XAPI format option', () => {
      const xapiLogger = new DataShopLogger({
        configuration: { log_service_url: 'https://test.com' },
        logFormat: 'XAPI'
      });
      
      expect(xapiLogger.getLogFormat()).toBe('XAPI');
    });

    it('should handle useSessionLog option', () => {
      global.navigator = { sendBeacon: jest.fn() } as any;
      
      const noSessionLogger = new DataShopLogger({
        configuration: { log_service_url: 'https://test.com' },
        useSessionLog: false
      });
      
      noSessionLogger.start();
      
      // Should only send context message, not session start
      expect((global.navigator.sendBeacon as jest.Mock)).toHaveBeenCalledTimes(1);
      const message = (global.navigator.sendBeacon as jest.Mock).mock.calls[0][1];
      expect(message).toContain(encodeURIComponent('<context_message')); // URL-encoded in wrapper
      expect(message).not.toContain('<log_session_start');
    });
  });
});