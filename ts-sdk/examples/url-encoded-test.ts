/**
 * Test with URL encoding
 */

import { DataShopLogger } from "../src";

// Temporarily modify sendMessage to try URL encoding
const logger = new DataShopLogger({
  configuration: {
    log_service_url: "https://learnlab.web.cmu.edu/log/server",
    dataset_name: "eason-test-1",
    problem_name: "URLEncoded_Test",
  },
});

console.log("🔍 URL Encoded Test");

// Only test context message
const sessionId = logger.start();
console.log(`✅ Session: ${sessionId}`);