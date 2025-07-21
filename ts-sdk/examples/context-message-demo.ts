/**
 * Demo: Understanding Context Messages in resume()
 * Shows exactly what XML is sent when calling resume()
 */

import { DataShopLogger } from "../src";

// Create logger with full configuration
const logger = new DataShopLogger({
  configuration: {
    log_service_url: "https://pslc-qa.andrew.cmu.edu/log/server",
    dataset_name: "MyDataset",
    problem_name: "Problem_123",
    problem_context: "Learning about context messages",
    class_name: "Math 101",
    school_name: "Demo University",
    instructor_name: "Dr. Smith",
    user_guid: "student-456",
  },
});

// Set up listener to see the actual XML
logger.setLogListener({
  listener: (message) => {
    console.log("\n📄 XML Message Sent:");
    console.log("=".repeat(80));
    
    // Pretty print the URL-decoded message if it's wrapped
    if (message.includes('info_type="tutor_message.dtd">')) {
      const match = message.match(/info_type="tutor_message\.dtd">(.*?)<\/log_action>/);
      if (match && match[1]) {
        const decoded = decodeURIComponent(match[1]);
        console.log(decoded);
      }
    } else {
      console.log(message);
    }
    
    console.log("=".repeat(80));
  },
});

console.log("🔍 Context Message Demo - What gets sent on resume()");
console.log("=====================================================\n");

// Start a new session
console.log("1️⃣ Starting new session...");
const sessionId = logger.start();
console.log(`   Session ID: ${sessionId}`);

// Save session info
const savedSession = {
  sessionId: logger.getSessionId(),
  contextMessageId: logger.getContextMessageId(),
};

console.log("\n2️⃣ Simulating page refresh...\n");

// Create new logger instance
const logger2 = new DataShopLogger({
  configuration: {
    log_service_url: "https://pslc-qa.andrew.cmu.edu/log/server",
    dataset_name: "MyDataset",
    problem_name: "Problem_123", // Same problem
    problem_context: "Learning about context messages",
    class_name: "Math 101",
    school_name: "Demo University", 
    instructor_name: "Dr. Smith",
    user_guid: "student-456", // Same user
  },
});

// Set up listener for logger2
logger2.setLogListener({
  listener: (message) => {
    console.log("\n📄 Context Message on resume():");
    console.log("=".repeat(80));
    
    if (message.includes('info_type="tutor_message.dtd">')) {
      const match = message.match(/info_type="tutor_message\.dtd">(.*?)<\/log_action>/);
      if (match && match[1]) {
        const decoded = decodeURIComponent(match[1]);
        console.log(decoded);
      }
    }
    
    console.log("=".repeat(80));
  },
});

console.log("3️⃣ Resuming session (this sends a context message)...");
logger2.resume(savedSession.sessionId!);

console.log("\n📊 Context Message Explanation:");
console.log("================================");
console.log("The context message sent on resume() contains:");
console.log("✓ context_message_id - Unique ID for this context");
console.log("✓ name='START_PROBLEM' - Indicates starting/resuming a problem");
console.log("✓ meta - Session metadata (user_id, session_id, timestamp)");
console.log("✓ class - Class information if configured");
console.log("✓ dataset - Dataset name and hierarchy");
console.log("✓ problem - Problem name and context");
console.log("\nThis re-establishes the learning context without creating a new session.");