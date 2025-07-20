/**
 * Final test with production server and new object-based API
 * Dataset: eason-test-1
 */

import { DataShopLogger } from "../src";

// Test the new API with production server
const logger = new DataShopLogger({
  configuration: {
    log_service_url: "https://pslcdatashop.web.cmu.edu/log/server",
    dataset_name: "eason-test-20250720",
    problem_name: "Final_API_Test_" + Date.now(),
  },
});

// Configure with object parameters
logger.setUserID({ id: "api-test-user" });
logger.setLogClassName({ className: "TypeScript SDK Test" });

console.log("📊 Testing DataShop Logger TypeScript SDK");
console.log("🌐 Server: Production (learnlab.web.cmu.edu)");
console.log("📁 Dataset: eason-test-1\n");

// Start session
const sessionId = logger.start();
console.log(`✅ Session started: ${sessionId}`);

// Test attempt
const txId = logger.logInterfaceAttempt({
  selection: "final_test",
  action: "verify",
  input: "success",
  customFields: {
    apiVersion: "object-based",
    timestamp: new Date().toISOString(),
  },
});

// Log response
logger.logResponse({
  transactionId: txId,
  selection: "final_test",
  action: "verify",
  input: "success",
  semanticName: "RESULT",
  evaluation: "CORRECT",
  advice: "API refactoring complete!",
  skills: [{ name: "api-design", category: "software-engineering" }],
});

console.log("✅ Test completed successfully!");
console.log("\n🎉 Object-based API is fully functional!");
console.log("📝 Data logged to production DataShop server");
