/**
 * Simple test to get a successful response
 */

import { DataShopLogger } from "../src";

// Create logger with minimal required fields
const logger = new DataShopLogger({
  configuration: {
    log_service_url: "https://learnlab.web.cmu.edu/log/server",
    dataset_name: "eason-test-1",
    problem_name: "Simple_Test",
    class_name: "Test_Class",
  },
});

// Set up log listener
logger.setLogListener({
  listener: (message) => {
    console.log("\n📄 XML Message:");
    console.log(message);
  },
});

console.log("🔍 Simple Success Test");
console.log("======================\n");

// Start session
const sessionId = logger.start();
console.log(`✅ Session started: ${sessionId}`);

// Simple tool message
const txId = logger.logInterfaceAttempt({
  selection: "button",
  action: "click",
  input: "submit",
});
console.log(`✅ Tool message sent: ${txId}`);

// Simple tutor message
logger.logResponse({
  transactionId: txId,
  selection: "button",
  action: "click",
  input: "submit",
  semanticName: "ATTEMPT",
  evaluation: "CORRECT",
});
console.log(`✅ Tutor message sent`);

setTimeout(() => {
  console.log("\n📊 Test completed. Check server responses above.");
}, 3000);