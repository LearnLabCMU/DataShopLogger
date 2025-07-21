/**
 * Example: Session Persistence for Single Page Applications
 * 
 * Demonstrates how to persist and resume DataShop sessions across
 * page refreshes or route changes in React/SPA applications.
 */

import { DataShopLogger } from "../src";

// Simulated browser storage (in real app, use localStorage or sessionStorage)
const SESSION_STORAGE_KEY = 'datashop_session';

interface SessionData {
  sessionId: string;
  userGuid: string;
  contextMessageId: string;
}

// Helper to save session data
function saveSession(logger: DataShopLogger): void {
  const sessionData: SessionData = {
    sessionId: logger.getSessionId() || '',
    userGuid: logger.getUserGuid() || '',
    contextMessageId: logger.getContextMessageId() || ''
  };
  
  // In a real app, you'd use:
  // localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  console.log('💾 Saving session:', sessionData);
  global.savedSession = sessionData; // Simulated storage
}

// Helper to load session data
function loadSession(): SessionData | null {
  // In a real app, you'd use:
  // const data = localStorage.getItem(SESSION_STORAGE_KEY);
  // return data ? JSON.parse(data) : null;
  
  return global.savedSession || null; // Simulated storage
}

// Initialize logger
const logger = new DataShopLogger({
  configuration: {
    log_service_url: "https://pslc-qa.andrew.cmu.edu/log/server",
    dataset_name: "SessionPersistenceDemo",
    problem_name: "React_SPA_Example",
    class_name: "Demo Class",
  },
});

console.log("🔍 Session Persistence Demo");
console.log("============================\n");

// Scenario 1: Initial page load - start new session
console.log("1️⃣ Initial page load - Starting new session");
const existingSession = loadSession();

if (existingSession) {
  console.log("   Found existing session, resuming...");
  logger.resume(existingSession.sessionId);
  console.log(`   ✅ Resumed session: ${existingSession.sessionId}`);
} else {
  console.log("   No existing session, starting new...");
  const sessionId = logger.start();
  console.log(`   ✅ Started new session: ${sessionId}`);
  saveSession(logger);
}

// Log some activity
const tx1 = logger.logInterfaceAttempt({
  selection: "page_1",
  action: "view",
  input: "home",
});
console.log(`   📝 Logged page view: ${tx1}`);

// Scenario 2: Simulate page refresh/route change
console.log("\n2️⃣ Simulating page refresh/route change...");
console.log("   (In a real app, the page would reload here)\n");

// Create new logger instance (simulating page reload)
const logger2 = new DataShopLogger({
  configuration: {
    log_service_url: "https://pslc-qa.andrew.cmu.edu/log/server",
    dataset_name: "SessionPersistenceDemo",
    problem_name: "React_SPA_Example",
    class_name: "Demo Class",
  },
});

// Resume existing session
const savedSession = loadSession();
if (savedSession) {
  console.log("   Found saved session, resuming...");
  logger2.resume(savedSession.sessionId);
  console.log(`   ✅ Resumed session: ${savedSession.sessionId}`);
  
  // Continue logging in the same session
  const tx2 = logger2.logInterfaceAttempt({
    selection: "page_2",
    action: "view",
    input: "dashboard",
  });
  console.log(`   📝 Logged page view in resumed session: ${tx2}`);
}

// Scenario 3: React component example
console.log("\n3️⃣ React Hook Example:");
console.log(`
// useDataShopLogger.ts
import { useEffect, useRef } from 'react';
import { DataShopLogger } from '@learnlab/datashop-logger';

export function useDataShopLogger(config: LogConfiguration) {
  const loggerRef = useRef<DataShopLogger | null>(null);
  
  useEffect(() => {
    if (!loggerRef.current) {
      loggerRef.current = new DataShopLogger({ configuration: config });
      
      // Check for existing session
      const savedSession = localStorage.getItem('datashop_session');
      if (savedSession) {
        const { sessionId } = JSON.parse(savedSession);
        loggerRef.current.resume(sessionId);
      } else {
        const sessionId = loggerRef.current.start();
        localStorage.setItem('datashop_session', JSON.stringify({
          sessionId,
          userGuid: loggerRef.current.getUserGuid(),
          contextMessageId: loggerRef.current.getContextMessageId()
        }));
      }
    }
    
    return () => {
      // Optional: Clear session on unmount
      // localStorage.removeItem('datashop_session');
    };
  }, []);
  
  return loggerRef.current;
}

// Usage in component:
function MyApp() {
  const logger = useDataShopLogger({
    log_service_url: "https://learnlab.web.cmu.edu/log/server",
    dataset_name: "MyDataset",
    problem_name: "MyProblem"
  });
  
  const handleClick = () => {
    logger?.logInterfaceAttempt({
      selection: "button",
      action: "click",
      input: "submit"
    });
  };
  
  return <button onClick={handleClick}>Submit</button>;
}
`);

console.log("\n✅ Session persistence demo completed!");
console.log("\n📌 Key Benefits:");
console.log("   • Continuous logging across page refreshes");
console.log("   • No duplicate session starts");
console.log("   • Preserves learning analytics continuity");
console.log("   • Works with React Router and other SPAs");

// Global declaration for TypeScript
declare global {
  var savedSession: SessionData | undefined;
}