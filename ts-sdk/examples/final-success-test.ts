/**
 * Final test with OLI format - matching JavaScript implementation
 */

import { DataShopLogger } from "../src";

console.log("🔍 Final DataShop Logger Test");
console.log("=============================\n");

// Create logger
const logger = new DataShopLogger({
  configuration: {
    log_service_url: "https://learnlab.web.cmu.edu/log/server",
    dataset_name: "eason-test-1",
    problem_name: "Final_OLI_Test",
    problem_context: "Testing OLI wrapped format",
    class_name: "TypeScript SDK Test",
    school_name: "CMU",
    instructor_name: "DataShop",
    user_guid: "test-user-oli",
  },
});

// Start session
console.log("1. Starting session...");
const sessionId = logger.start();
console.log(`   ✅ Session: ${sessionId}`);

// Simple attempt
console.log("\n2. Logging attempt...");
const tx1 = logger.logInterfaceAttempt({
  selection: "test_button",
  action: "click",
  input: "submit",
  customFields: {
    testType: "OLI_format",
  },
});
console.log(`   ✅ Transaction: ${tx1}`);

// Correct response
console.log("\n3. Logging correct response...");
logger.logResponse({
  transactionId: tx1,
  selection: "test_button",
  action: "click",
  input: "submit",
  semanticName: "ATTEMPT",
  evaluation: "CORRECT",
  advice: "Perfect! OLI format working.",
  skills: [
    { name: "data-logging", category: "technical" },
  ],
});
console.log("   ✅ Response logged");

// Test with dataset levels
console.log("\n4. Testing with dataset levels...");
logger.reset({
  configuration: {
    log_service_url: "https://learnlab.web.cmu.edu/log/server",
    dataset_name: "eason-test-1",
    problem_name: "Level_Test",
    dataset_level_name1: "Module_1",
    dataset_level_type1: "module",
    dataset_level_name2: "Lesson_A",
    dataset_level_type2: "lesson",
  },
});

const session2 = logger.start();
console.log(`   ✅ Session 2: ${session2}`);

// Hint interaction
console.log("\n5. Testing hint interaction...");
const hintTx = logger.logInterfaceHintRequest({
  selection: "help_button",
  action: "click",
  input: "help",
});

logger.logHintResponse({
  transactionId: hintTx,
  selection: "help_button",
  action: "click",
  input: "help",
  currentHintNumber: 1,
  totalHintsAvailable: 3,
  hintText: "Check the OLI message format in the XML",
});
console.log("   ✅ Hint logged");

console.log("\n✅ All tests completed!");
console.log("📊 Messages have been sent to DataShop in OLI format.");
console.log("🔍 Check the XML format includes:");
console.log("   - URL-encoded content in <log_action> wrapper");
console.log("   - Proper tutor_related_message_sequence wrapping");
console.log("   - All required attributes for OLI compatibility");

// Keep process alive briefly to ensure all messages are sent
setTimeout(() => {
  console.log("\n✨ Test session finished.");
  process.exit(0);
}, 2000);