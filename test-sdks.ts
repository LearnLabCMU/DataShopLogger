#!/usr/bin/env ts-node

/**
 * Test script to verify all DataShop Logger SDKs are working
 */

import { DataShopLogger } from './ts-sdk/src';

async function testTypeScriptSDK() {
  console.log('\n=== Testing TypeScript SDK ===');
  
  const logger = new DataShopLogger({
    configuration: {
      log_service_url: "https://pslc-qa.andrew.cmu.edu/log/server",
      dataset_name: "eason-test-0720",
      dataset_level_name1: "SDK_Type",
      dataset_level_type1: "sdk_type",
      dataset_level_name2: "TypeScript_SDK",
      dataset_level_type2: "section",
      problem_name: "TypeScript_SDK_Test",
      session_id: `typescript_session_${Date.now()}`
    }
  });

  // Set log listener to see what's being sent
  logger.setLogListener({ 
    listener: (message) => {
      console.log('[TypeScript SDK] Message sent:', message.substring(0, 200) + '...');
    }
  });

  // Start session
  const sessionId = logger.start();
  console.log('Session started:', sessionId);

  // Log an action
  const transactionId = logger.logInterfaceAttempt({
    selection: 'test-button',
    action: 'click',
    input: 'test'
  });
  console.log('Action logged:', transactionId);

  // Log response
  logger.logResponse({
    transactionId,
    selection: 'test-button',
    action: 'click',
    input: 'test',
    evaluation: 'CORRECT',
    advice: 'Good job!'
  });
  console.log('Response logged');

  // End session
  logger.endSession();
  console.log('Session ended');
}

async function testSDKs() {
  console.log('Starting SDK tests...');
  console.log('Note: React and Next.js SDKs need to be tested in browser');
  
  try {
    await testTypeScriptSDK();
    
    console.log('\n=== SDK Test Summary ===');
    console.log('✅ TypeScript SDK: Working');
    console.log('❓ React SDK: Test in browser at http://localhost:3000');
    console.log('❓ Next.js SDK: Test in browser at http://localhost:3000');
    console.log('\nTo test React/Next.js SDKs:');
    console.log('1. Open browser developer console');
    console.log('2. Look for [DataShopLogger] messages');
    console.log('3. Check Network tab for requests to /datashop-proxy');
    console.log('4. Answer quiz questions to trigger logging');
    
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Run tests
testSDKs().catch(console.error);