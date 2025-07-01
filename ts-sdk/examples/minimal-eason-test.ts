/**
 * Minimal example logging to eason-test-1 dataset
 */

import { DataShopLogger } from '../src';

// Create logger configured for eason-test-1 dataset
const logger = new DataShopLogger({
  configuration: {
    log_service_url: 'https://pslc-qa.andrew.cmu.edu/log/server',
    dataset_name: 'eason-test-1',  // Your specific dataset
    problem_name: 'Quick_Test_' + Date.now(),
    user_guid: 'test-user-001'
  }
});

// Start session
const sessionId = logger.start();
console.log(`Logging to dataset: eason-test-1`);
console.log(`Session ID: ${sessionId}`);

// Log a student action
const txId = logger.logInterfaceAttempt(
  'answer_field',
  'submit',
  '42'
);

// Log the system's response
logger.logResponse(
  txId,
  'answer_field',
  'submit',
  '42',
  'RESULT',
  'CORRECT',
  'Great job!'
);

console.log('\nData logged successfully to eason-test-1 dataset!');
console.log('Check DataShop QA server in a few minutes.');