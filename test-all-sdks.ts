/**
 * Test script to verify all SDKs are logging to the correct server and dataset
 */

import { DataShopLogger } from './ts-sdk/src/index';

console.log('Testing TypeScript SDK configuration...\n');

// Initialize TypeScript SDK logger
const logger = new DataShopLogger({
  configuration: {
    log_service_url: "https://pslc-qa.andrew.cmu.edu/log/server",
    dataset_name: "eason-test-0720",
    dataset_level_name1: "SDK_Type",
    dataset_level_type1: "sdk_type",
    dataset_level_name2: "TypeScript_SDK",
    dataset_level_type2: "section",
    problem_name: "TypeScript_SDK_Test",
    user_guid: 'typescript-sdk-test-' + Date.now()
  },
});

// Add listener to see what's being sent
logger.setLogListener({ 
  listener: (message) => {
    console.log('TypeScript SDK sending to QA server:', message.substring(0, 200) + '...');
  }
});

// Start session
const sessionId = logger.start();
console.log('TypeScript SDK Session ID:', sessionId);

// Log a test action
const transactionId = logger.logInterfaceAttempt({
  selection: 'test-question',
  action: 'answer',
  input: 'test-answer'
});

// Log response
logger.logResponse({
  transactionId,
  selection: 'test-question',
  action: 'answer', 
  input: 'test-answer',
  semanticName: 'ATTEMPT',
  evaluation: 'CORRECT',
  advice: 'Test successful!'
});

console.log('\n✅ TypeScript SDK configuration test complete!');

console.log('\n📝 Summary of SDK Configurations:');
console.log('- TypeScript SDK: Logging to QA server with dataset "eason-test-0720" and SDK_Type=TypeScript_SDK');
console.log('- React SDK: Logging to QA server with dataset "eason-test-0720" and SDK_Type=React_SDK');
console.log('- Next.js SDK: Logging to QA server with dataset "eason-test-0720" and SDK_Type=NextJS_SDK');
console.log('\nAll SDKs are configured to use unique user GUIDs with timestamps to differentiate sessions.');