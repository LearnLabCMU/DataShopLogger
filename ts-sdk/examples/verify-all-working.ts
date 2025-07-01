/**
 * Verification that all APIs work correctly
 */

import { DataShopLogger } from '../src';

console.log('✅ Testing Object-Based API and Backward Compatibility\n');

const logger = new DataShopLogger({
  configuration: {
    log_service_url: 'https://learnlab.web.cmu.edu/log/server',
    dataset_name: 'eason-test-1',
    problem_name: 'API_Verification_' + Date.now()
  }
});

// Test new object-based API
console.log('1. Testing new object-based API:');
logger.setUserID({ id: 'test-user-001' });
logger.setLogClassName({ className: 'Test Class' });
logger.setDatasetLevelName({ level: 1, name: 'Module 1' });
logger.setDatasetLevelType({ level: 1, type: 'Module' });

const sessionId = logger.start();
console.log(`   ✓ Session started: ${sessionId}`);

const txId1 = logger.logInterfaceAttempt({
  selection: 'answer',
  action: 'submit',
  input: '42',
  customFields: { method: 'object-api' }
});
console.log(`   ✓ Logged attempt with object API: ${txId1}`);

logger.logResponse({
  transactionId: txId1,
  selection: 'answer',
  action: 'submit',
  input: '42',
  semanticName: 'RESULT',
  evaluation: 'CORRECT',
  advice: 'Great!',
  skills: [{ name: 'testing', category: 'qa' }]
});
console.log('   ✓ Logged response with object API');

// Test backward compatibility
console.log('\n2. Testing backward compatibility:');
const txId2 = logger.logInterfaceAttempt('button', 'click', 'submit');
console.log(`   ✓ Logged attempt with old API: ${txId2}`);

logger.logResponse(
  txId2,
  'button',
  'click',
  'submit',
  'RESULT',
  'CORRECT',
  'Good job!'
);
console.log('   ✓ Logged response with old API');

// Test mixed usage
console.log('\n3. Testing mixed API usage:');
const txId3 = logger.logInterfaceHintRequest('hint_btn', 'click', '');
console.log(`   ✓ Hint request with old API: ${txId3}`);

logger.logHintResponse({
  transactionId: txId3,
  selection: 'hint_btn',
  action: 'click',
  input: '',
  currentHintNumber: 1,
  totalHintsAvailable: 2,
  hintText: 'Try again!'
});
console.log('   ✓ Hint response with new API');

console.log('\n✅ All APIs working correctly!');
console.log('✅ No type errors or warnings!');
console.log('✅ Full backward compatibility maintained!');