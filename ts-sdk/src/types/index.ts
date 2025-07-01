export interface LogConfiguration {
  session_id?: string;
  context_message_id?: string;
  log_service_url?: string;
  class_name?: string;
  school_name?: string;
  period_name?: string;
  class_description?: string;
  instructor_name?: string;
  dataset_name?: string;
  problem_name?: string;
  problem_context?: string;
  user_guid?: string;
  auth_token?: string;
  source_id?: string;
  // Support multiple dataset levels
  [key: string]: unknown;
}

export interface SAI {
  selection: string | string[];
  action: string | string[];
  input: string | string[];
}

export interface ActionEvaluation {
  evaluation: 'CORRECT' | 'INCORRECT' | 'HINT' | 'BUG' | 'NO_MATCH';
  classification?: string;
  currentHintNumber?: number;
  totalHintsAvailable?: number;
  hintID?: string;
}

export interface CustomField {
  name: string;
  value: string | number | boolean;
}

export interface LogMessage {
  transaction_id: string;
  timestamp: Date;
  type: 'tool_message' | 'tutor_message' | 'context_message';
}

export interface ToolMessage extends LogMessage {
  type: 'tool_message';
  sai: SAI;
  semantic_event: string;
  semantic_event_subtype?: string;
  custom_fields?: CustomField[];
}

export interface Skill {
  name: string;
  category?: string;
  opportunities?: number;
  predicted_error_rate?: number;
}

// Object-based parameter interfaces for cleaner API
export interface LogAttemptParams {
  selection: string | string[];
  action: string | string[];
  input: string | string[];
  customFields?: Record<string, unknown>;
}

export interface LogAttemptSAIParams {
  sai: SAI;
  customFields?: Record<string, unknown>;
}

export interface LogHintRequestParams {
  selection: string | string[];
  action: string | string[];
  input: string | string[];
  customFields?: Record<string, unknown>;
}

export interface LogResponseParams {
  transactionId: string;
  selection: string | string[];
  action: string | string[];
  input: string | string[];
  semanticName: string;
  evaluation: string | ActionEvaluation;
  advice?: string;
  customFields?: Record<string, unknown>;
  skills?: Skill[];
}

export interface LogResponseSAIParams {
  transactionId: string;
  sai: SAI;
  semanticName: string;
  evaluation: string | ActionEvaluation;
  advice?: string;
  customFields?: Record<string, unknown>;
  skills?: Skill[];
}

export interface LogHintResponseParams {
  transactionId: string;
  selection: string | string[];
  action: string | string[];
  input: string | string[];
  currentHintNumber: number;
  totalHintsAvailable: number;
  hintText: string;
  customFields?: Record<string, unknown>;
}

export interface ResetParams {
  configuration?: LogConfiguration;
}

export interface SetLogFormatParams {
  format: 'DATASHOP' | 'XAPI';
}

export interface SetLoggingURLParams {
  url: string;
}

export interface SetContextNameParams {
  name: string;
}

export interface SetContextMessageIDParams {
  id: string;
}

export interface SetUserIDParams {
  id: string;
}

export interface SetProblemNameParams {
  name: string;
}

export interface SetProblemContextParams {
  context: string;
}

export interface SetDatasetNameParams {
  name: string;
}

export interface SetSchoolParams {
  school: string;
}

export interface SetPeriodParams {
  period: string;
}

export interface SetInstructorParams {
  instructor: string;
}

export interface SetDescriptionParams {
  description: string;
}

export interface SetLogClassNameParams {
  className: string;
}

export interface SetDatasetLevelNameParams {
  level: number;
  name: string;
}

export interface SetDatasetLevelTypeParams {
  level: number;
  type: string;
}

export interface SetUseSessionLogParams {
  use: boolean;
}

export interface SetLogListenerParams {
  listener: (message: string) => void;
}

export interface TutorMessage extends LogMessage {
  type: 'tutor_message';
  sai: SAI;
  semantic_event: string;
  semantic_event_subtype?: string;
  evaluation: ActionEvaluation;
  feedback?: string;
  skills?: Skill[];
  custom_fields?: CustomField[];
}

export interface ContextMessage extends LogMessage {
  type: 'context_message';
  name: string;
  context_message_id: string;
}

export interface LoggingLibraryOptions {
  configuration?: LogConfiguration;
  logFormat?: 'DATASHOP' | 'XAPI';
  useSessionLog?: boolean;
}

export interface IDataShopLogger {
  // Core methods
  start(): string;
  reset(params: ResetParams): void;
  endSession(): void;
  
  // Logging methods with object parameters
  logInterfaceAttempt(params: LogAttemptParams): string;
  logInterfaceAttemptSAI(params: LogAttemptSAIParams): string;
  logInterfaceHintRequest(params: LogHintRequestParams): string;
  logHintResponse(params: LogHintResponseParams): void;
  logResponse(params: LogResponseParams): void;
  logResponseSAI(params: LogResponseSAIParams): void;
  
  // Configuration methods with object parameters
  setLogFormat(params: SetLogFormatParams): void;
  getLogFormat(): 'DATASHOP' | 'XAPI';
  setLoggingURL(params: SetLoggingURLParams): void;
  setLoggingURLQA(): void;
  setLoggingURLProduction(): void;
  setContextName(params: SetContextNameParams): void;
  getContextName(): string;
  setContextMessageID(params: SetContextMessageIDParams): void;
  getContextMessageID(): string;
  setUserID(params: SetUserIDParams): void;
  setProblemName(params: SetProblemNameParams): void;
  setProblemContext(params: SetProblemContextParams): void;
  setDatasetName(params: SetDatasetNameParams): void;
  setSchool(params: SetSchoolParams): void;
  setPeriod(params: SetPeriodParams): void;
  setInstructor(params: SetInstructorParams): void;
  setDescription(params: SetDescriptionParams): void;
  setLogClassName(params: SetLogClassNameParams): void;
  setDatasetLevelName(params: SetDatasetLevelNameParams): void;
  setDatasetLevelType(params: SetDatasetLevelTypeParams): void;
  setUseSessionLog(params: SetUseSessionLogParams): void;
  getLastSAI(): SAI | null;
  setLogListener(params: SetLogListenerParams): void;
  
  // Deprecated methods (for backward compatibility)
  /** @deprecated Use object parameter version instead */
  logInterfaceAttempt(
    selection: string | string[],
    action: string | string[],
    input: string | string[],
    customFields?: Record<string, unknown>
  ): string;
  /** @deprecated Use object parameter version instead */
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
}