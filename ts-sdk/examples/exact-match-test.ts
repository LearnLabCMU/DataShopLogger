/**
 * Test with exact XML matching the JavaScript example
 */

import { DataShopLogger } from "../src";

// Create logger matching the example from JS comments
const logger = new DataShopLogger({
  configuration: {
    log_service_url: "https://learnlab.web.cmu.edu/log/server",
    dataset_name: "Mathtutor",
    dataset_level_name1: "QA2.0_debug_enabled_tutor",
    dataset_level_type1: "ProblemSet",
    problem_name: "1415-error",
    class_name: "Default Class",
    school_name: "Admin",
    instructor_name: "admin",
  },
});

// Set up log listener to see XML
logger.setLogListener({
  listener: (message) => {
    console.log("\n📄 XML:");
    console.log(message);
  },
});

console.log("🔍 Exact Match Test - Matching JavaScript Example");

// Start session
const sessionId = logger.start();
console.log(`\n✅ Session: ${sessionId}`);