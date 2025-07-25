import React, { createContext, useContext, useRef, useEffect, useState, useCallback } from 'react';
import { DataShopLogger } from '@learnlab/datashop-logger';
import type { LogConfiguration, SAI } from '@learnlab/datashop-logger';

interface DataShopLoggerContextValue {
  logger: DataShopLogger | null;
  sessionId: string | null;
  isInitialized: boolean;
  initialize: (config: LogConfiguration) => string;
  logAction: (selection: string, action: string, input: string, customFields?: Record<string, string>) => string | null;
  logResponse: (params: {
    transactionId: string;
    selection: string;
    action: string;
    input: string;
    outcome: 'CORRECT' | 'INCORRECT' | 'HINT' | 'SUBMITTED' | string;
    semanticName?: string;
    feedback?: string;
    customFields?: Record<string, string>;
    skills?: Array<{
      category: string;
      name: string;
      opportunity?: number;
      predicted_error_rate?: number;
    }>;
  }) => void;
  clearSession: () => void;
  resumeSession: (sessionId: string) => void;
  getLastSAI: () => SAI | null;
  setUserGuid: (guid: string) => void;
  setProblemName: (name: string) => void;
  setDatasetLevelName: (level: number, name: string) => void;
  setDatasetLevelType: (level: number, type: string) => void;
  getUserGuid: () => string | undefined;
}

const DataShopLoggerContext = createContext<DataShopLoggerContextValue | null>(null);

const SESSION_STORAGE_KEY = 'datashop-logger-session';
const USER_GUID_STORAGE_KEY = 'datashop-logger-user-guid';

interface DataShopLoggerProviderProps {
  children: React.ReactNode;
  config?: LogConfiguration;
  autoInitialize?: boolean;
  persistSession?: boolean;
}

export function DataShopLoggerProvider({ 
  children, 
  config,
  autoInitialize = false,
  persistSession = true 
}: DataShopLoggerProviderProps) {
  const loggerRef = useRef<DataShopLogger | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const configRef = useRef<LogConfiguration | undefined>(config);

  // Update config ref when config changes
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Auto-initialize on mount if requested
  useEffect(() => {
    if (autoInitialize && config && !isInitialized) {
      console.log('[DataShopLogger] Auto-initializing with config:', config);
      initialize(config);
    }
  }, []); // Empty deps to run only once on mount

  const initialize = useCallback((initConfig: LogConfiguration) => {
    // Check if we already have a session in localStorage
    let sessionToUse: string | null = null;
    
    if (persistSession && typeof window !== 'undefined') {
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed.sessionId) {
            sessionToUse = parsed.sessionId;
          }
        } catch (error) {
          console.error('Failed to parse saved session:', error);
        }
      }
    }
    
    // Generate new session ID only if we don't have one
    const reactSessionId = sessionToUse || `react_session_${crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).substring(2, 11)}`;
    
    // Get or generate user GUID
    let userGuid = initConfig.user_guid;
    if (!userGuid && typeof window !== 'undefined') {
      const storedGuid = localStorage.getItem(USER_GUID_STORAGE_KEY);
      if (storedGuid) {
        userGuid = storedGuid;
      } else {
        userGuid = `react-user-${crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).substring(2, 11)}`;
        localStorage.setItem(USER_GUID_STORAGE_KEY, userGuid);
      }
    }
    
    const configWithIds = { 
      ...initConfig, 
      session_id: reactSessionId,
      user_guid: userGuid || initConfig.user_guid
    };
    
    const logger = new DataShopLogger({ configuration: configWithIds });
    
    // Add a log listener for debugging
    logger.setLogListener({ 
      listener: (message) => {
        console.log('[DataShopLogger] Sending message:', message);
      }
    });
    
    // If we're reusing a session, resume it instead of starting new
    let finalSessionId: string;
    if (sessionToUse) {
      logger.resume(reactSessionId);
      finalSessionId = reactSessionId;
    } else {
      finalSessionId = logger.start();
    }
    
    loggerRef.current = logger;
    setSessionId(finalSessionId);
    setIsInitialized(true);

    // Save to localStorage
    if (persistSession && typeof window !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        sessionId: finalSessionId,
        config: initConfig
      }));
    }

    return finalSessionId;
  }, [persistSession]);

  const resumeSession = useCallback((resumeSessionId: string) => {
    if (!loggerRef.current) {
      throw new Error('Logger not initialized. Call initialize() first.');
    }
    
    loggerRef.current.resume(resumeSessionId);
    setSessionId(resumeSessionId);

    // Update localStorage
    if (persistSession && typeof window !== 'undefined') {
      const savedData = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
            ...parsed,
            sessionId: resumeSessionId
          }));
        } catch (error) {
          console.error('Failed to update session storage:', error);
        }
      }
    }
  }, [persistSession]);

  const logAction = useCallback((
    selection: string,
    action: string,
    input: string,
    customFields?: Record<string, string>
  ): string | null => {
    if (!loggerRef.current) {
      console.warn('Logger not initialized. Call initialize() first.');
      return null;
    }

    return loggerRef.current.logInterfaceAttempt({
      selection,
      action,
      input,
      customFields
    });
  }, []);

  const logResponse = useCallback((params: {
    transactionId: string;
    selection: string;
    action: string;
    input: string;
    outcome: 'CORRECT' | 'INCORRECT' | 'HINT' | 'SUBMITTED' | string;
    semanticName?: string;
    feedback?: string;
    customFields?: Record<string, string>;
    skills?: Array<{
      category: string;
      name: string;
      opportunity?: number;
      predicted_error_rate?: number;
    }>;
  }) => {
    if (!loggerRef.current) {
      console.warn('Logger not initialized. Call initialize() first.');
      return;
    }

    loggerRef.current.logResponse({
      transactionId: params.transactionId,
      selection: params.selection,
      action: params.action,
      input: params.input,
      semanticName: params.semanticName || 'attempt',
      evaluation: params.outcome,
      advice: params.feedback,
      customFields: params.customFields,
      skills: params.skills
    });
  }, []);

  const clearSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    loggerRef.current = null;
    setSessionId(null);
    setIsInitialized(false);
    
    // Automatically reinitialize with a new session
    // Use the config from ref or saved config from localStorage
    const configToUse = configRef.current || (() => {
      if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem(SESSION_STORAGE_KEY);
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            return parsed.config;
          } catch (error) {
            console.error('Failed to parse saved config:', error);
          }
        }
      }
      return null;
    })();
    
    if (configToUse) {
      setTimeout(() => {
        initialize(configToUse);
      }, 100); // Small delay to ensure state is cleared
    }
  }, [initialize]);

  const getLastSAI = useCallback((): SAI | null => {
    if (!loggerRef.current) {
      return null;
    }
    return loggerRef.current.getLastSAI();
  }, []);

  const setUserGuid = useCallback((guid: string) => {
    if (!loggerRef.current) {
      console.warn('Logger not initialized. Call initialize() first.');
      return;
    }
    loggerRef.current.setUserID({ id: guid });
    
    // Also update localStorage if we're persisting sessions
    if (persistSession && typeof window !== 'undefined') {
      localStorage.setItem(USER_GUID_STORAGE_KEY, guid);
    }
  }, [persistSession]);

  const setProblemName = useCallback((name: string) => {
    if (!loggerRef.current) {
      console.warn('Logger not initialized. Call initialize() first.');
      return;
    }
    loggerRef.current.setProblemName({ name });
  }, []);

  const setDatasetLevelName = useCallback((level: number, name: string) => {
    if (!loggerRef.current) {
      console.warn('Logger not initialized. Call initialize() first.');
      return;
    }
    loggerRef.current.setDatasetLevelName({ level, name });
  }, []);

  const setDatasetLevelType = useCallback((level: number, type: string) => {
    if (!loggerRef.current) {
      console.warn('Logger not initialized. Call initialize() first.');
      return;
    }
    loggerRef.current.setDatasetLevelType({ level, type });
  }, []);

  const getUserGuid = useCallback((): string | undefined => {
    if (!loggerRef.current) {
      return undefined;
    }
    return loggerRef.current.getUserGuid();
  }, []);

  const value: DataShopLoggerContextValue = {
    logger: loggerRef.current,
    sessionId,
    isInitialized,
    initialize,
    logAction,
    logResponse,
    clearSession,
    resumeSession,
    getLastSAI,
    setUserGuid,
    setProblemName,
    setDatasetLevelName,
    setDatasetLevelType,
    getUserGuid
  };

  return (
    <DataShopLoggerContext.Provider value={value}>
      {children}
    </DataShopLoggerContext.Provider>
  );
}

export function useDataShopLogger() {
  const context = useContext(DataShopLoggerContext);
  if (!context) {
    throw new Error('useDataShopLogger must be used within a DataShopLoggerProvider');
  }
  return context;
}