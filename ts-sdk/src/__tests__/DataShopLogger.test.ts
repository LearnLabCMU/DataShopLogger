import { DataShopLogger } from '../DataShopLogger';
import type { LogConfiguration, SAI } from '../types';

describe('DataShopLogger', () => {
  let logger: DataShopLogger;
  let mockSendBeacon: jest.Mock;
  let loggedMessages: string[] = [];

  beforeEach(() => {
    loggedMessages = [];
    mockSendBeacon = jest.fn().mockReturnValue(true);
    
    // Override the global navigator.sendBeacon for this test
    Object.defineProperty(global.navigator, 'sendBeacon', {
      value: mockSendBeacon,
      writable: true,
      configurable: true,
    });
    
    const config: LogConfiguration = {
      log_service_url: 'https://test.example.com/log',
      dataset_name: 'TestDataset',
      problem_name: 'TestProblem',
      user_guid: 'test-user-123',
    };
    
    logger = new DataShopLogger({ configuration: config });
    logger.setLogListener({ listener: (message) => loggedMessages.push(message) });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultLogger = new DataShopLogger();
      expect(defaultLogger.getLogFormat()).toBe('DATASHOP');
      expect(defaultLogger.getContextName()).toBe('START_PROBLEM');
    });

    it('should initialize with custom configuration', () => {
      const customConfig: LogConfiguration = {
        dataset_name: 'CustomDataset',
        context_name: 'CUSTOM_CONTEXT',
      };
      const customLogger = new DataShopLogger({ configuration: customConfig });
      expect(customLogger.getContextName()).toBe('CUSTOM_CONTEXT');
    });
  });

  describe('start()', () => {
    it('should return a session ID', () => {
      const sessionId = logger.start();
      expect(sessionId).toMatch(/^ctat_session_[0-9a-f-]+$/);
    });

    it('should send log session start and context messages', () => {
      logger.start();
      expect(mockSendBeacon).toHaveBeenCalledTimes(2);
      
      const sessionStartCall = mockSendBeacon.mock.calls[0];
      expect(sessionStartCall[1]).toContain('<log_session_start');
      expect(sessionStartCall[1]).toContain('info_type="tutor_message.dtd"/>');
      
      const contextCall = mockSendBeacon.mock.calls[1];
      // Context messages are wrapped and URL-encoded
      expect(contextCall[1]).toContain(encodeURIComponent('<context_message'));
      expect(contextCall[1]).toContain('START_PROBLEM');
    });
  });

  describe('logInterfaceAttempt()', () => {
    it('should log a tool message for interface attempt', () => {
      const transactionId = logger.logInterfaceAttempt('button1', 'click', 'submit');
      
      expect(transactionId).toMatch(/^T[0-9a-f-]+$/);
      expect(mockSendBeacon).toHaveBeenCalledTimes(1);
      
      const message = mockSendBeacon.mock.calls[0][1];
      // Tool messages are wrapped and URL-encoded
      expect(message).toContain(encodeURIComponent('<tool_message'));
      expect(message).toContain(encodeURIComponent('<semantic_event'));
      expect(message).toContain(encodeURIComponent('name="ATTEMPT"'));
      expect(message).toContain(encodeURIComponent('<selection>button1</selection>'));
      expect(message).toContain(encodeURIComponent('<action>click</action>'));
      expect(message).toContain(encodeURIComponent('<input><![CDATA[submit]]></input>'));
    });

    it('should handle array inputs', () => {
      logger.logInterfaceAttempt(['btn1', 'btn2'], ['click', 'hover'], ['val1', 'val2']);
      
      const message = mockSendBeacon.mock.calls[0][1];
      expect(message).toContain(encodeURIComponent('<selection>btn1</selection>'));
      expect(message).toContain(encodeURIComponent('<selection>btn2</selection>'));
      expect(message).toContain(encodeURIComponent('<action>click</action>'));
      expect(message).toContain(encodeURIComponent('<action>hover</action>'));
      expect(message).toContain(encodeURIComponent('<input><![CDATA[val1]]></input>'));
      expect(message).toContain(encodeURIComponent('<input><![CDATA[val2]]></input>'));
    });

    it('should include custom fields', () => {
      logger.logInterfaceAttempt('button1', 'click', 'submit', {
        customField1: 'value1',
        customField2: 123,
      });
      
      const message = mockSendBeacon.mock.calls[0][1];
      expect(message).toContain(encodeURIComponent('<custom_field><name>customField1</name><value>value1</value></custom_field>'));
      expect(message).toContain(encodeURIComponent('<custom_field><name>customField2</name><value>123</value></custom_field>'));
    });
  });

  describe('logInterfaceAttemptSAI()', () => {
    it('should log using SAI object', () => {
      const sai: SAI = {
        selection: 'input1',
        action: 'setValue',
        input: '42',
      };
      
      const transactionId = logger.logInterfaceAttemptSAI(sai);
      expect(transactionId).toMatch(/^T[0-9a-f-]+$/);
      
      const message = mockSendBeacon.mock.calls[0][1];
      expect(message).toContain(encodeURIComponent('<selection>input1</selection>'));
      expect(message).toContain(encodeURIComponent('<action>setValue</action>'));
      expect(message).toContain(encodeURIComponent('<input><![CDATA[42]]></input>'));
    });
  });

  describe('logInterfaceHintRequest()', () => {
    it('should log a hint request', () => {
      const transactionId = logger.logInterfaceHintRequest('hintButton', 'click', '');
      
      expect(transactionId).toMatch(/^T[0-9a-f-]+$/);
      
      const message = mockSendBeacon.mock.calls[0][1];
      expect(message).toContain(encodeURIComponent('name="HINT_REQUEST"'));
      expect(message).toContain(encodeURIComponent('<selection>hintButton</selection>'));
    });
  });

  describe('logHintResponse()', () => {
    it('should log a hint response', () => {
      const transactionId = 'T12345';
      logger.logHintResponse(
        transactionId,
        'hintButton',
        'click',
        '',
        1,
        3,
        'Try clicking the submit button'
      );
      
      const message = mockSendBeacon.mock.calls[0][1];
      expect(message).toContain(encodeURIComponent('<tutor_message'));
      expect(message).toContain(encodeURIComponent('name="HINT_MSG"'));
      expect(message).toContain(encodeURIComponent('HINT'));
      expect(message).toContain(encodeURIComponent('current_hint_number="1"'));
      expect(message).toContain(encodeURIComponent('total_hints_available="3"'));
      expect(message).toContain(encodeURIComponent('Try clicking the submit button'));
    });
  });

  describe('logResponse()', () => {
    it('should log a tutor response with evaluation', () => {
      const transactionId = 'T12345';
      logger.logResponse(
        transactionId,
        'input1',
        'setValue',
        '42',
        'RESULT',
        'CORRECT',
        'Great job!',
        { skill: 'addition' }
      );
      
      const message = mockSendBeacon.mock.calls[0][1];
      expect(message).toContain(encodeURIComponent('<tutor_message'));
      expect(message).toContain(encodeURIComponent('name="RESULT"'));
      expect(message).toContain(encodeURIComponent('<action_evaluation>CORRECT'));
      expect(message).toContain(encodeURIComponent('Great job!'));
      expect(message).toContain(encodeURIComponent('<custom_field><name>skill</name><value>addition</value></custom_field>'));
    });

    it('should handle ActionEvaluation object', () => {
      const transactionId = 'T12345';
      logger.logResponse(
        transactionId,
        'input1',
        'setValue',
        '42',
        'RESULT',
        {
          evaluation: 'INCORRECT',
          classification: 'arithmetic-error',
        },
        'Try again',
        {}
      );
      
      const message = mockSendBeacon.mock.calls[0][1];
      expect(message).toContain(encodeURIComponent('INCORRECT'));
      expect(message).toContain(encodeURIComponent('classification="arithmetic-error"'));
    });
  });

  describe('configuration methods', () => {
    it('should set and get context name', () => {
      logger.setContextName({ name: 'NEW_CONTEXT' });
      expect(logger.getContextName()).toBe('NEW_CONTEXT');
    });

    it('should set and get context message ID', () => {
      logger.setContextMessageID({ id: 'C12345' });
      expect(logger.getContextMessageID()).toBe('C12345');
    });

    it('should set logging URL', () => {
      logger.setLoggingURL({ url: 'https://custom.example.com/log' });
      logger.logInterfaceAttempt('test', 'test', 'test');
      
      expect(mockSendBeacon).toHaveBeenCalledWith(
        'https://custom.example.com/log',
        expect.any(String)
      );
    });

    it('should set QA logging URL', () => {
      logger.setLoggingURLQA();
      logger.logInterfaceAttempt('test', 'test', 'test');
      
      expect(mockSendBeacon).toHaveBeenCalledWith(
        'https://pslc-qa.andrew.cmu.edu/log/server',
        expect.any(String)
      );
    });

    it('should set production logging URL', () => {
      logger.setLoggingURLProduction();
      logger.logInterfaceAttempt('test', 'test', 'test');
      
      expect(mockSendBeacon).toHaveBeenCalledWith(
        'https://learnlab.web.cmu.edu/log/server',
        expect.any(String)
      );
    });
  });

  describe('reset()', () => {
    it('should reset configuration', () => {
      const newConfig: LogConfiguration = {
        dataset_name: 'NewDataset',
        problem_name: 'NewProblem',
        log_service_url: 'https://new.example.com/log',
      };
      
      logger.reset(newConfig);
      
      // Start a new session to see the context message with dataset
      logger.start();
      
      // The second call should be the context message
      const contextMessage = mockSendBeacon.mock.calls[1][1];
      expect(contextMessage).toContain('NewDataset');
      expect(contextMessage).toContain('NewProblem');
      
      // Clear mock and test logging URL
      mockSendBeacon.mockClear();
      logger.logInterfaceAttempt('test', 'test', 'test');
      
      expect(mockSendBeacon).toHaveBeenCalledWith(
        'https://new.example.com/log',
        expect.any(String)
      );
    });
  });

  describe('XML escaping', () => {
    it('should properly escape XML special characters', () => {
      logger.logInterfaceAttempt(
        'button&<>"\'',
        'click',
        'value with <tags> & "quotes"'
      );
      
      const message = mockSendBeacon.mock.calls[0][1];
      expect(message).toContain(encodeURIComponent('button&amp;&lt;&gt;&quot;&apos;'));
      expect(message).not.toContain(encodeURIComponent('button&<>"\''));
      expect(message).toContain(encodeURIComponent('<![CDATA[value with <tags> & "quotes"]]>'));
    });
  });

  describe('error handling', () => {
    it('should throw error when log_service_url is not configured', () => {
      const loggerWithoutUrl = new DataShopLogger();
      expect(() => {
        loggerWithoutUrl.logInterfaceAttempt('test', 'test', 'test');
      }).toThrow('log_service_url is not configured');
    });

    it('should throw error for unsupported log format', () => {
      logger.setLogFormat({ format: 'XAPI' });
      expect(() => {
        logger.logInterfaceAttempt('test', 'test', 'test');
      }).toThrow('Unsupported log format: XAPI');
    });
  });

  describe('log listener', () => {
    it('should call log listener with formatted messages', () => {
      logger.logInterfaceAttempt('button1', 'click', 'submit');
      
      expect(loggedMessages).toHaveLength(1);
      expect(loggedMessages[0]).toContain('<?xml version="1.0" encoding="UTF-8"?><log_action');
      expect(loggedMessages[0]).toContain(encodeURIComponent('<tutor_related_message_sequence'));
    });
  });
});