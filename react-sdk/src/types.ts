import type { DataShopLogger, LogConfiguration, SAI } from '@learnlab/datashop-logger';

export interface DataShopLoggerContextValue {
  logger: DataShopLogger | null;
  sessionId: string | null;
  isInitialized: boolean;
  startSession: () => string;
  resumeSession: (sessionId: string) => void;
  clearSession: () => void;
  setProblemName: (problemName: string) => void;
  setUserGuid: (userGuid: string) => void;
  logInterfaceAttempt: (selection: string, action: string, input?: string | string[], customFields?: Record<string, string>) => void;
  logInterfaceAttemptSAI: (sai: SAI, customFields?: Record<string, string>) => void;
  logResponse: (params: {
    transactionId?: string;
    selection: string | string[];
    action: string | string[];
    input: string | string[];
    semanticName?: string;
    evaluation: 'CORRECT' | 'INCORRECT' | 'HINT' | 'BUG' | 'NO_MATCH';
    advice?: string;
    customFields?: Record<string, unknown>;
    skills?: Array<{
      name: string;
      category?: string;
      opportunities?: number;
      predicted_error_rate?: number;
    }>;
  }) => void;
}

export interface DataShopLoggerProviderProps {
  children: React.ReactNode;
  configuration?: Partial<LogConfiguration>;
  autoStart?: boolean;
  persistSession?: boolean;
  storageKey?: string;
}