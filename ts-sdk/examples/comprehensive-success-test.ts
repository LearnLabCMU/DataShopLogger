/**
 * Comprehensive test to ensure all messages are accepted by DataShop
 */

import { DataShopLogger } from "../src";

console.log("🔍 Comprehensive DataShop Success Test");
console.log("=====================================\n");

// Test 1: Complete configuration with all fields
console.log("Test 1: Full configuration");
const logger1 = new DataShopLogger({
  configuration: {
    log_service_url: "https://learnlab.web.cmu.edu/log/server",
    dataset_name: "eason-test-1",
    problem_name: "TypeScript_SDK_Test_Problem",
    problem_context: "Testing the TypeScript SDK implementation",
    class_name: "Test Class",
    school_name: "Carnegie Mellon University",
    instructor_name: "Test Instructor",
    period_name: "Fall 2025",
    class_description: "TypeScript SDK Testing",
    user_guid: "test-user-123",
  },
});

const session1 = logger1.start();
console.log(`✅ Session 1 started: ${session1}`);

// Log a simple attempt and response
const tx1 = logger1.logInterfaceAttempt({
  selection: "button1",
  action: "click",
  input: "submit",
});

logger1.logResponse({
  transactionId: tx1,
  selection: "button1",
  action: "click",
  input: "submit",
  semanticName: "ATTEMPT",
  evaluation: "CORRECT",
  advice: "Good job!",
});

// Test 2: Minimal configuration (most similar to what works in JS)
console.log("\nTest 2: Minimal configuration");
const logger2 = new DataShopLogger({
  configuration: {
    log_service_url: "https://learnlab.web.cmu.edu/log/server",
    dataset_name: "eason-test-1",
    problem_name: "Minimal_Problem",
  },
});

const session2 = logger2.start();
console.log(`✅ Session 2 started: ${session2}`);

// Test 3: With dataset levels
console.log("\nTest 3: With dataset levels");
const logger3 = new DataShopLogger({
  configuration: {
    log_service_url: "https://learnlab.web.cmu.edu/log/server",
    dataset_name: "eason-test-1",
    problem_name: "Level_Test_Problem",
    dataset_level_name1: "Unit_1",
    dataset_level_type1: "unit",
    dataset_level_name2: "Section_A",
    dataset_level_type2: "section",
  },
});

const session3 = logger3.start();
console.log(`✅ Session 3 started: ${session3}`);

// Test 4: Complex interaction with skills
console.log("\nTest 4: Complex interaction with skills");
const logger4 = new DataShopLogger({
  configuration: {
    log_service_url: "https://learnlab.web.cmu.edu/log/server",
    dataset_name: "eason-test-1",
    problem_name: "Skills_Test_Problem",
  },
});

const session4 = logger4.start();
console.log(`✅ Session 4 started: ${session4}`);

// Attempt
const tx4 = logger4.logInterfaceAttempt({
  selection: "equation_field",
  action: "solve",
  input: "x=5",
  customFields: {
    problemType: "algebra",
    difficulty: "medium",
  },
});

// Incorrect response with hint
logger4.logResponse({
  transactionId: tx4,
  selection: "equation_field",
  action: "solve",
  input: "x=5",
  semanticName: "ATTEMPT",
  evaluation: "INCORRECT",
  advice: "Remember to isolate x on one side of the equation",
  skills: [
    { name: "solving-linear-equations", category: "algebra" },
    { name: "algebraic-manipulation", category: "algebra" },
  ],
});

// Hint request
const hintTx = logger4.logInterfaceHintRequest({
  selection: "equation_field",
  action: "solve",
  input: "help",
});

// Hint response
logger4.logHintResponse({
  transactionId: hintTx,
  selection: "equation_field",
  action: "solve",
  input: "help",
  currentHintNumber: 1,
  totalHintsAvailable: 3,
  hintText: "Try subtracting 3 from both sides first",
});

// Correct attempt
const tx5 = logger4.logInterfaceAttempt({
  selection: "equation_field",
  action: "solve",
  input: "x=2",
});

logger4.logResponse({
  transactionId: tx5,
  selection: "equation_field",
  action: "solve",
  input: "x=2",
  semanticName: "ATTEMPT",
  evaluation: "CORRECT",
  advice: "Excellent! You correctly solved for x.",
  skills: [
    { name: "solving-linear-equations", category: "algebra" },
    { name: "algebraic-manipulation", category: "algebra" },
  ],
});

console.log("\n✅ All tests completed!");
console.log("Check DataShop server for logged data.");

// Wait a bit for all messages to be sent
setTimeout(() => {
  console.log("\n📊 Test finished. Messages should be visible in DataShop.");
}, 2000);