/**
 * Test with QA server for better error messages
 */

import { DataShopLogger } from "../src";

// Use QA server
const logger = new DataShopLogger({
  configuration: {
    log_service_url: "https://pslc-qa.andrew.cmu.edu/log/server",
    dataset_name: "TestDataset",
    problem_name: "TestProblem",
  },
});

// Set up log listener
logger.setLogListener({
  listener: (message) => {
    console.log("\n📄 XML:");
    console.log(message);
  },
});

console.log("🔍 QA Server Test");
console.log("==================\n");

// Only send context message
const sessionId = logger.start();
console.log(`✅ Session: ${sessionId}`);

setTimeout(() => {
  console.log("\n📊 Test completed.");
}, 1000);