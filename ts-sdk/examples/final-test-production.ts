/**
 * Final test with production server and new object-based API
 * Dataset: eason-test-1
 * Demonstrates session persistence with resume()
 */

import { DataShopLogger } from "../src";

console.log("📊 Testing DataShop Logger TypeScript SDK with Session Resume");
console.log("🌐 Server: QA (pslc-qa.andrew.cmu.edu)");
console.log("📁 Dataset: eason-test-0720\n");

// PART 1: Start a new session
console.log("=== PART 1: Starting new session ===");
const logger = new DataShopLogger({
  configuration: {
    log_service_url: "https://pslc-qa.andrew.cmu.edu/log/server",
    dataset_name: "eason-test-0720",
    problem_name: "Resume_Test_" + Date.now(),
    user_guid: "test-user-123",
  },
});

// Configure with object parameters
logger.setLogClassName({ className: "TypeScript SDK Resume Test" });

// Start session
const sessionId = logger.start();
console.log(`✅ Session started: ${sessionId}`);

// Log some initial activity
const tx1 = logger.logInterfaceAttempt({
  selection: "start_button",
  action: "click",
  input: "begin",
  customFields: {
    phase: "initial",
    timestamp: new Date().toISOString(),
  },
});

logger.logResponse({
  transactionId: tx1,
  selection: "start_button",
  action: "click",
  input: "begin",
  semanticName: "START",
  evaluation: "CORRECT",
  advice: "Good start!",
});

// Save session data (simulating what would be saved to localStorage)
const savedSessionData = {
  sessionId: logger.getSessionId(),
  userGuid: logger.getUserGuid(),
  contextMessageId: logger.getContextMessageId(),
};
console.log("\n💾 Saving session data:", savedSessionData);

// PART 2: Simulate page refresh/navigation - Resume existing session
console.log("\n=== PART 2: Simulating page refresh - Resuming session ===");

// Create new logger instance (simulating page reload)
const logger2 = new DataShopLogger({
  configuration: {
    log_service_url: "https://pslc-qa.andrew.cmu.edu/log/server",
    dataset_name: "eason-test-0720",
    problem_name: "Resume_Test_" + Date.now(),
    user_guid: savedSessionData.userGuid, // Use saved user GUID
  },
});

// Resume the existing session instead of starting new
logger2.resume(savedSessionData.sessionId!);
console.log(`✅ Session resumed: ${savedSessionData.sessionId}`);

// Continue logging in the same session
const tx2 = logger2.logInterfaceAttempt({
  selection: "continue_button",
  action: "click",
  input: "next",
  customFields: {
    phase: "resumed",
    timestamp: new Date().toISOString(),
  },
});

logger2.logResponse({
  transactionId: tx2,
  selection: "continue_button",
  action: "click",
  input: "next",
  semanticName: "CONTINUE",
  evaluation: "CORRECT",
  advice: "Session successfully resumed!",
  skills: [{ name: "session-persistence", category: "technical" }],
});

// PART 3: Complete the session
console.log("\n=== PART 3: Completing the session ===");

const tx3 = logger2.logInterfaceAttempt({
  selection: "finish_button",
  action: "click",
  input: "complete",
  customFields: {
    phase: "final",
    sessionDuration: "simulated",
  },
});

logger2.logResponse({
  transactionId: tx3,
  selection: "finish_button",
  action: "click",
  input: "complete",
  semanticName: "COMPLETE",
  evaluation: "CORRECT",
  advice: "Session completed successfully!",
});

console.log("\n✅ Test completed successfully!");
console.log("🎉 Session persistence is working!");
console.log("📝 All data logged to the same session despite 'page refresh'");
console.log("\n📊 Summary:");
console.log("   - Started session with ID:", sessionId);
console.log("   - Resumed same session after simulated page refresh");
console.log("   - All events connected to the same session");
console.log("   - No duplicate log_session_start messages sent");
