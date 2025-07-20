/**
 * Debug test to identify XML parsing errors
 */

import { DataShopLogger } from "../src";

// Create logger with debug listener to capture XML
const logger = new DataShopLogger({
  configuration: {
    log_service_url: "https://learnlab.web.cmu.edu/log/server",
    dataset_name: "eason-test-1",
    problem_name: "Debug_Test_" + Date.now(),
  },
});

// Set up log listener to see the actual XML being sent
logger.setLogListener({
  listener: (message) => {
    console.log("\n📄 XML Message:");
    console.log("================");
    console.log(message);
    console.log("================\n");
  },
});

console.log("🔍 Debug Test - Identifying XML Issues");
console.log("🌐 Server: Production");
console.log("📁 Dataset: eason-test-1\n");

// Test 1: Simple message without dataset levels
console.log("Test 1: Basic message without dataset levels");
const sessionId = logger.start();
console.log(`Session started: ${sessionId}`);

// Test 2: Add dataset levels and see what happens
console.log("\nTest 2: Message with dataset levels");
logger.reset({
  configuration: {
    log_service_url: "https://learnlab.web.cmu.edu/log/server",
    dataset_name: "eason-test-1",
    problem_name: "Debug_Test_Levels_" + Date.now(),
    dataset_level_name1: "Unit1",
    dataset_level_type1: "unit",
    dataset_level_name2: "Section1",
    dataset_level_type2: "section",
  },
});
const sessionId2 = logger.start();
console.log(`Session 2 started: ${sessionId2}`);

// Test 3: Simple tool message
console.log("\nTest 3: Tool message");
const txId = logger.logInterfaceAttempt({
  selection: "debug_test",
  action: "test",
  input: "value",
});

// Test 4: Tutor message with skills
console.log("\nTest 4: Tutor message with skills");
logger.logResponse({
  transactionId: txId,
  selection: "debug_test",
  action: "test",
  input: "value",
  semanticName: "TEST",
  evaluation: "CORRECT",
  advice: "Good job!",
  skills: [{ name: "debugging", category: "problem-solving" }],
});

console.log("\n✅ Debug test completed. Check console output for XML messages.");