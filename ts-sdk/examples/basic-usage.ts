/**
 * Basic usage example of DataShop Logger TypeScript SDK
 * This example demonstrates the fundamental logging operations
 */

import { DataShopLogger } from '../src';

// Initialize the logger with configuration
const logger = new DataShopLogger({
  configuration: {
    // Use QA server for testing
    log_service_url: 'https://pslc-qa.andrew.cmu.edu/log/server',
    
    // Dataset information
    dataset_name: 'BasicUsageExample',
    dataset_level_name1: 'Module1',
    dataset_level_type1: 'Module',
    
    // Problem information
    problem_name: 'SimpleAddition',
    problem_context: 'Learning basic addition with single digits',
    
    // Class information (optional)
    class_name: 'Demo Class',
    school_name: 'Demo School',
    instructor_name: 'Demo Teacher',
    
    // User will be auto-generated if not provided
    // user_guid: 'demo-user-123'
  }
});

// Add a log listener to see what's being sent
logger.setLogListener((message) => {
  console.log('=== Log Message Sent ===');
  console.log(message);
  console.log('========================\n');
});

async function runExample() {
  console.log('Starting DataShop Logger Basic Usage Example\n');
  
  // Start the logging session
  const sessionId = logger.start();
  console.log(`Started session: ${sessionId}\n`);
  
  // Simulate a student attempting to solve: 3 + 4 = ?
  console.log('Student attempts to solve: 3 + 4 = ?');
  
  // Log the first attempt (incorrect)
  console.log('Student enters: 6');
  const attempt1 = logger.logInterfaceAttempt(
    'answer_input',
    'setValue',
    '6',
    {
      problemText: '3 + 4 = ?',
      attemptNumber: 1
    }
  );
  
  // Log tutor response
  console.log('Tutor response: Incorrect');
  logger.logResponse(
    attempt1,
    'answer_input',
    'setValue',
    '6',
    'RESULT',
    'INCORRECT',
    'Not quite. Try counting on your fingers: start with 3 and add 4 more.'
  );
  
  // Student requests a hint
  console.log('\nStudent requests a hint');
  const hintRequest = logger.logInterfaceHintRequest(
    'hint_button',
    'click',
    ''
  );
  
  // Provide hint
  console.log('System provides hint');
  logger.logHintResponse(
    hintRequest,
    'hint_button',
    'click',
    '',
    1,  // This is hint 1
    2,  // Out of 2 total hints
    'Remember: 3 + 4 means starting with 3 and counting up 4 more times.'
  );
  
  // Log the second attempt (correct)
  console.log('\nStudent enters: 7');
  const attempt2 = logger.logInterfaceAttempt(
    'answer_input',
    'setValue',
    '7',
    {
      problemText: '3 + 4 = ?',
      attemptNumber: 2,
      afterHint: true
    }
  );
  
  // Log success
  console.log('Tutor response: Correct!');
  logger.logResponse(
    attempt2,
    'answer_input',
    'setValue',
    '7',
    'RESULT',
    'CORRECT',
    'Excellent! 3 + 4 = 7. You got it!'
  );
  
  // End the session
  console.log('\nEnding session...');
  logger.endSession();
  
  console.log('Example completed!');
}

// Run the example
runExample().catch(console.error);