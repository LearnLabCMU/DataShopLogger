import type { 
  IDataShopLogger, 
  LogConfiguration, 
  LoggingLibraryOptions, 
  SAI, 
  ActionEvaluation,
  Skill,
  LogAttemptParams,
  LogAttemptSAIParams,
  LogHintRequestParams,
  LogResponseParams,
  LogResponseSAIParams,
  LogHintResponseParams,
  ResetParams,
  SetLogFormatParams,
  SetLoggingURLParams,
  SetContextNameParams,
  SetContextMessageIDParams,
  SetUserIDParams,
  SetProblemNameParams,
  SetProblemContextParams,
  SetDatasetNameParams,
  SetSchoolParams,
  SetPeriodParams,
  SetInstructorParams,
  SetDescriptionParams,
  SetLogClassNameParams,
  SetDatasetLevelNameParams,
  SetDatasetLevelTypeParams,
  SetUseSessionLogParams,
  SetLogListenerParams
} from './types';
import { LogMessageBuilder } from './utils/LogMessageBuilder';
import { generateGUID, generateTransactionID, generateContextMessageID } from './utils/guid';
import { ConfigurationError, NetworkError } from './errors/DataShopLoggerError';

export class DataShopLogger implements IDataShopLogger {
  private configuration: LogConfiguration;
  private logFormat: 'DATASHOP' | 'XAPI' = 'DATASHOP';
  private useSessionLog: boolean = true;
  private lastTransactionID: string = '';
  private lastSAI: SAI | null = null;
  private messageBuilder: LogMessageBuilder;
  private logListener?: (message: string) => void;

  // Default values
  private readonly defaultConfiguration: Partial<LogConfiguration> = {
    dataset_name: 'UnassignedDataset',
    dataset_level_name1: 'UnassignedLevelName',
    dataset_level_type1: 'UnassignedLevelType',
    source_id: 'tutor',
  };

  constructor(options?: LoggingLibraryOptions) {
    this.configuration = {
      ...this.defaultConfiguration,
      ...options?.configuration,
    };
    
    if (options?.logFormat) {
      this.logFormat = options.logFormat;
    }
    
    if (options?.useSessionLog !== undefined) {
      this.useSessionLog = options.useSessionLog;
    }
    
    this.messageBuilder = new LogMessageBuilder(this.configuration);
    this.initializeSession();
  }

  private initializeSession(): void {
    if (!this.configuration.session_id) {
      this.configuration.session_id = `ctat_session_${generateGUID()}`;
    }
    
    if (!this.configuration.context_message_id) {
      this.configuration.context_message_id = generateContextMessageID();
    }
    
    if (!this.configuration.user_guid) {
      this.configuration.user_guid = generateGUID();
    }
  }

  start(): string {
    this.initializeSession();
    
    if (this.useSessionLog) {
      const sessionStartMessage = this.messageBuilder.createLogSessionStart();
      this.sendMessage(sessionStartMessage);
    }
    
    const contextMessage = this.messageBuilder.createContextMessage();
    this.sendMessage(contextMessage);
    
    return this.configuration.session_id!;
  }

  // New object-based API
  reset(params: ResetParams): void;
  // Backward compatibility overload
  reset(configuration?: LogConfiguration): void;
  // Implementation
  reset(paramsOrConfig?: ResetParams | LogConfiguration): void {
    let config: LogConfiguration | undefined;
    
    // Check if using new object-based API
    if (paramsOrConfig && typeof paramsOrConfig === 'object' && 'configuration' in paramsOrConfig) {
      config = (paramsOrConfig as ResetParams).configuration;
    } 
    // Backward compatibility
    else {
      config = paramsOrConfig as LogConfiguration | undefined;
    }
    
    this.configuration = {
      ...this.defaultConfiguration,
      ...config,
    };
    this.messageBuilder = new LogMessageBuilder(this.configuration);
    this.initializeSession();
  }

  // New object-based API methods
  logInterfaceAttempt(params: LogAttemptParams): string;
  // Backward compatibility overload
  logInterfaceAttempt(
    selection: string | string[],
    action: string | string[],
    input: string | string[],
    customFields?: Record<string, unknown>
  ): string;
  // Implementation
  logInterfaceAttempt(
    paramsOrSelection: LogAttemptParams | string | string[],
    action?: string | string[],
    input?: string | string[],
    customFields?: Record<string, unknown>
  ): string {
    // Check if using new object-based API
    if (typeof paramsOrSelection === 'object' && !Array.isArray(paramsOrSelection) && 'selection' in paramsOrSelection) {
      const params = paramsOrSelection;
      const sai: SAI = { 
        selection: params.selection, 
        action: params.action, 
        input: params.input 
      };
      return this.logInterfaceAttemptSAI({ sai, customFields: params.customFields });
    } 
    // Backward compatibility: old positional parameters
    else {
      const sai: SAI = { 
        selection: paramsOrSelection, 
        action: action!, 
        input: input! 
      };
      return this.logInterfaceAttemptSAI({ sai, customFields });
    }
  }

  // New object-based API
  logInterfaceAttemptSAI(params: LogAttemptSAIParams): string;
  // Backward compatibility overload
  logInterfaceAttemptSAI(sai: SAI, customFields?: Record<string, unknown>): string;
  // Implementation
  logInterfaceAttemptSAI(
    paramsOrSai: LogAttemptSAIParams | SAI,
    customFields?: Record<string, unknown>
  ): string {
    let sai: SAI;
    let fields: Record<string, unknown> | undefined;
    
    // Check if using new object-based API
    if ('sai' in paramsOrSai) {
      sai = paramsOrSai.sai;
      fields = paramsOrSai.customFields;
    }
    // Backward compatibility: old API
    else {
      sai = paramsOrSai;
      fields = customFields;
    }
    
    const transactionID = generateTransactionID();
    this.lastTransactionID = transactionID;
    this.lastSAI = sai;
    
    this.messageBuilder.resetCustomFields();
    this.messageBuilder.addCustomFields(fields);
    this.messageBuilder.addCustomField('tool_event_time', this.messageBuilder.formatTimeStamp(new Date()) + ' UTC');
    
    const message = this.messageBuilder.createSemanticEventToolMessage(
      sai,
      transactionID,
      'ATTEMPT',
      undefined,
      undefined
    );
    
    this.sendMessage(message);
    return transactionID;
  }

  // New object-based API
  logInterfaceHintRequest(params: LogHintRequestParams): string;
  // Backward compatibility overload
  logInterfaceHintRequest(
    selection: string | string[],
    action: string | string[],
    input: string | string[],
    customFields?: Record<string, unknown>
  ): string;
  // Implementation
  logInterfaceHintRequest(
    paramsOrSelection: LogHintRequestParams | string | string[],
    action?: string | string[],
    input?: string | string[],
    customFields?: Record<string, unknown>
  ): string {
    let sai: SAI;
    let fields: Record<string, unknown> | undefined;
    
    // Check if using new object-based API
    if (typeof paramsOrSelection === 'object' && !Array.isArray(paramsOrSelection) && 'selection' in paramsOrSelection) {
      const params = paramsOrSelection;
      sai = { 
        selection: params.selection, 
        action: params.action, 
        input: params.input 
      };
      fields = params.customFields;
    } 
    // Backward compatibility: old positional parameters
    else {
      sai = { 
        selection: paramsOrSelection, 
        action: action!, 
        input: input! 
      };
      fields = customFields;
    }
    
    const transactionID = generateTransactionID();
    this.lastTransactionID = transactionID;
    
    this.messageBuilder.resetCustomFields();
    this.messageBuilder.addCustomFields(fields);
    this.messageBuilder.addCustomField('tool_event_time', this.messageBuilder.formatTimeStamp(new Date()) + ' UTC');
    
    const message = this.messageBuilder.createSemanticEventToolMessage(
      sai,
      transactionID,
      'HINT_REQUEST',
      undefined,
      undefined
    );
    
    this.sendMessage(message);
    return transactionID;
  }

  // New object-based API
  logHintResponse(params: LogHintResponseParams): void;
  // Backward compatibility overload
  logHintResponse(
    transactionID: string,
    selection: string | string[],
    action: string | string[],
    input: string | string[],
    currentHintNumber: number,
    totalHintsAvailable: number,
    hintText: string,
    customFields?: Record<string, unknown>
  ): void;
  // Implementation
  logHintResponse(
    paramsOrTransactionID: LogHintResponseParams | string,
    selection?: string | string[],
    action?: string | string[],
    input?: string | string[],
    currentHintNumber?: number,
    totalHintsAvailable?: number,
    hintText?: string,
    customFields?: Record<string, unknown>
  ): void {
    // Check if using new object-based API
    if (typeof paramsOrTransactionID === 'object' && 'transactionId' in paramsOrTransactionID) {
      const params = paramsOrTransactionID;
      const evaluation: ActionEvaluation = {
        evaluation: 'HINT',
        currentHintNumber: params.currentHintNumber,
        totalHintsAvailable: params.totalHintsAvailable,
      };
      
      this.logResponse({
        transactionId: params.transactionId,
        selection: params.selection,
        action: params.action,
        input: params.input,
        semanticName: 'HINT_MSG',
        evaluation,
        advice: params.hintText,
        customFields: params.customFields
      });
    }
    // Backward compatibility: old positional parameters
    else {
      const evaluation: ActionEvaluation = {
        evaluation: 'HINT',
        currentHintNumber: currentHintNumber!,
        totalHintsAvailable: totalHintsAvailable!,
      };
      
      this.logResponse({
        transactionId: paramsOrTransactionID,
        selection: selection!,
        action: action!,
        input: input!,
        semanticName: 'HINT_MSG',
        evaluation,
        advice: hintText!,
        customFields
      });
    }
  }

  // New object-based API
  logResponse(params: LogResponseParams): void;
  // Backward compatibility overload
  logResponse(
    transactionID: string,
    selection: string | string[],
    action: string | string[],
    input: string | string[],
    semanticName: string,
    evaluation: string | ActionEvaluation,
    advice: string,
    customFields?: Record<string, unknown>,
    skills?: Skill[]
  ): void;
  // Implementation
  logResponse(
    paramsOrTransactionID: LogResponseParams | string,
    selection?: string | string[],
    action?: string | string[],
    input?: string | string[],
    semanticName?: string,
    evaluation?: string | ActionEvaluation,
    advice?: string,
    customFields?: Record<string, unknown>,
    skills?: Skill[]
  ): void {
    // Check if using new object-based API
    if (typeof paramsOrTransactionID === 'object' && 'transactionId' in paramsOrTransactionID) {
      const params = paramsOrTransactionID;
      const sai: SAI = { 
        selection: params.selection, 
        action: params.action, 
        input: params.input 
      };
      this.logResponseSAI({
        transactionId: params.transactionId,
        sai,
        semanticName: params.semanticName,
        evaluation: params.evaluation,
        advice: params.advice,
        customFields: params.customFields,
        skills: params.skills
      });
    } 
    // Backward compatibility: old positional parameters
    else {
      const sai: SAI = { selection: selection!, action: action!, input: input! };
      this.logResponseSAI({
        transactionId: paramsOrTransactionID,
        sai,
        semanticName: semanticName!,
        evaluation: evaluation!,
        advice: advice!,
        customFields,
        skills
      });
    }
  }

  // New object-based API
  logResponseSAI(params: LogResponseSAIParams): void;
  // Backward compatibility overload
  logResponseSAI(
    transactionID: string,
    sai: SAI,
    semanticName: string,
    evaluation: string | ActionEvaluation,
    advice: string,
    customFields?: Record<string, unknown>,
    skills?: Skill[]
  ): void;
  // Implementation
  logResponseSAI(
    paramsOrTransactionID: LogResponseSAIParams | string,
    sai?: SAI,
    semanticName?: string,
    evaluation?: string | ActionEvaluation,
    advice?: string,
    customFields?: Record<string, unknown>,
    skills?: Skill[]
  ): void {
    let actualParams: LogResponseSAIParams;
    
    // Check if using new object-based API
    if (typeof paramsOrTransactionID === 'object' && 'sai' in paramsOrTransactionID) {
      actualParams = paramsOrTransactionID;
    }
    // Backward compatibility
    else {
      actualParams = {
        transactionId: paramsOrTransactionID,
        sai: sai!,
        semanticName: semanticName!,
        evaluation: evaluation!,
        advice: advice!,
        customFields,
        skills
      };
    }
    
    const evalObj: ActionEvaluation = typeof actualParams.evaluation === 'string' 
      ? { evaluation: actualParams.evaluation as ActionEvaluation['evaluation'] }
      : actualParams.evaluation;
    
    this.lastSAI = actualParams.sai;
    
    this.messageBuilder.resetCustomFields();
    this.messageBuilder.addCustomFields(actualParams.customFields);
    this.messageBuilder.addCustomField('tutor_event_time', this.messageBuilder.formatTimeStamp(new Date()) + ' UTC');
    
    const formattedFeedback = actualParams.advice ? `<![CDATA[${actualParams.advice}]]>` : '';
    
    const message = this.messageBuilder.createTutorMessage(
      actualParams.sai,
      actualParams.transactionId || this.lastTransactionID,
      actualParams.semanticName,
      evalObj,
      formattedFeedback,
      undefined,
      actualParams.skills
    );
    
    this.sendMessage(message);
  }

  private sendMessage(message: string): void {
    if (this.logFormat === 'DATASHOP') {
      const wrappedMessage = this.messageBuilder.wrapForDataShop(message);
      
      if (!this.configuration.log_service_url) {
        throw new ConfigurationError('log_service_url is not configured');
      }
      
      // Use sendBeacon if available, otherwise fall back to fetch
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon(this.configuration.log_service_url, wrappedMessage);
      } else if (typeof fetch !== 'undefined') {
        // Non-blocking fetch for Node.js or modern browsers
        fetch(this.configuration.log_service_url, {
          method: 'POST',
          body: wrappedMessage,
          headers: {
            'Content-Type': 'application/xml',
          },
          keepalive: true,
        }).catch((error) => {
          console.error('Failed to send log message:', error);
        });
      } else {
        throw new NetworkError('No suitable method for sending log messages');
      }
      
      // Call log listener if registered
      if (this.logListener) {
        this.logListener(wrappedMessage);
      }
    } else {
      throw new ConfigurationError(`Unsupported log format: ${this.logFormat}`);
    }
  }

  // Configuration methods with object parameters
  setLogFormat(params: SetLogFormatParams): void {
    this.logFormat = params.format;
  }

  getLogFormat(): 'DATASHOP' | 'XAPI' {
    return this.logFormat;
  }

  setLoggingURL(params: SetLoggingURLParams): void {
    this.configuration.log_service_url = params.url;
  }

  setLoggingURLQA(): void {
    this.setLoggingURL({ url: 'https://pslc-qa.andrew.cmu.edu/log/server' });
  }

  setLoggingURLProduction(): void {
    this.setLoggingURL({ url: 'https://learnlab.web.cmu.edu/log/server' });
  }

  setContextName(params: SetContextNameParams): void {
    this.configuration.context_name = params.name;
  }

  getContextName(): string {
    return (this.configuration.context_name || 'START_PROBLEM') as string;
  }

  setContextMessageID(params: SetContextMessageIDParams): void {
    this.configuration.context_message_id = params.id;
  }

  getContextMessageID(): string {
    return this.configuration.context_message_id || '';
  }

  setUserID(params: SetUserIDParams): void {
    this.configuration.user_guid = params.id;
  }

  setProblemName(params: SetProblemNameParams): void {
    this.configuration.problem_name = params.name;
  }

  setProblemContext(params: SetProblemContextParams): void {
    this.configuration.problem_context = params.context;
  }

  setDatasetName(params: SetDatasetNameParams): void {
    this.configuration.dataset_name = params.name;
  }

  setSchool(params: SetSchoolParams): void {
    this.configuration.school_name = params.school;
  }

  setPeriod(params: SetPeriodParams): void {
    this.configuration.period_name = params.period;
  }

  setInstructor(params: SetInstructorParams): void {
    this.configuration.instructor_name = params.instructor;
  }

  setDescription(params: SetDescriptionParams): void {
    this.configuration.class_description = params.description;
  }

  setLogClassName(params: SetLogClassNameParams): void {
    this.configuration.class_name = params.className;
  }

  setDatasetLevelName(params: SetDatasetLevelNameParams): void {
    this.configuration[`dataset_level_name${params.level}`] = params.name;
  }

  setDatasetLevelType(params: SetDatasetLevelTypeParams): void {
    this.configuration[`dataset_level_type${params.level}`] = params.type;
  }

  setUseSessionLog(params: SetUseSessionLogParams): void {
    this.useSessionLog = params.use;
  }

  getLastSAI(): SAI | null {
    return this.lastSAI;
  }

  endSession(): void {
    // Generate new session for next use
    this.configuration.session_id = `ctat_session_${generateGUID()}`;
  }

  setLogListener(params: SetLogListenerParams): void {
    this.logListener = params.listener;
  }
}
