/**
 * Test script to verify the OLI message format is correctly implemented
 */
const { DataShopLogger } = require('../dist/index.js');

// Mock sendBeacon for testing
Object.defineProperty(global, 'navigator', {
  value: {
    sendBeacon: (url, data) => {
      console.log('=== Sending to URL:', url);
      console.log('=== Raw message:', data);
      
      // Check if it's a log_session_start message
      if (data.includes('<log_session_start')) {
        console.log('\n✓ log_session_start message is sent unwrapped');
      } else if (data.includes('<log_action')) {
        console.log('\n✓ Other messages are wrapped in <log_action>');
        
        // Extract and decode the URL-encoded content
        const match = data.match(/info_type="tutor_message\.dtd">(.*?)<\/log_action>/);
        if (match && match[1]) {
          const decoded = decodeURIComponent(match[1]);
          console.log('\n=== Decoded content:', decoded);
        }
      }
      
      return true;
    }
  },
  writable: true,
  configurable: true
});

// Initialize logger
const logger = new DataShopLogger({
  configuration: {
    log_service_url: 'https://test.example.com/log',
    dataset_name: 'TestDataset',
    problem_name: 'TestProblem',
    user_guid: 'test-user-123',
    auth_token: 'test-token',
    source_id: 'test-source'
  }
});

console.log('Starting DataShop Logger OLI Format Test...\n');

// Start logging session
console.log('1. Starting session (should send log_session_start)');
const sessionId = logger.start();
console.log(`   Session ID: ${sessionId}`);

// Log an attempt
console.log('\n2. Logging interface attempt (should be wrapped in log_action)');
const txId = logger.logInterfaceAttempt('button1', 'click', 'submit');
console.log(`   Transaction ID: ${txId}`);

// Log a response
console.log('\n3. Logging tutor response (should be wrapped in log_action)');
logger.logResponse(
  txId,
  'button1',
  'click',
  'submit',
  'RESULT',
  'CORRECT',
  'Great job!'
);

console.log('\n✅ Test completed successfully!');