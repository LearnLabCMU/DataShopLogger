/**
 * Minimal test to identify the exact issue
 */

import { DataShopLogger } from "../src";

// Create minimal logger
const logger = new DataShopLogger({
  configuration: {
    log_service_url: "https://learnlab.web.cmu.edu/log/server",
    dataset_name: "eason-test-1",
    problem_name: "Minimal_Test",
    // Ensure no dataset levels
  },
});

// Set up log listener to see XML
logger.setLogListener({
  listener: (message) => {
    console.log("\n📄 XML:");
    console.log(message);
  },
});

console.log("🔍 Minimal Test");

// Only send context message
const sessionId = logger.start();

console.log(`\n✅ Session: ${sessionId}`);