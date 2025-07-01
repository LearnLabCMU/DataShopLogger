/**
 * Integration test for DataShop Logger with real server
 * This tests the actual logging to DataShop QA server
 */

import { DataShopLogger } from '../src';
import type { Skill } from '../src';

async function runIntegrationTest() {
  console.log('=== DataShop Logger Integration Test ===\n');
  console.log('Testing with dataset: eason-test-0701\n');

  // Initialize logger with full configuration
  const logger = new DataShopLogger({
    configuration: {
      // Use QA server for testing
      log_service_url: 'https://pslc-qa.andrew.cmu.edu/log/server',
      
      // Dataset configuration
      dataset_name: 'eason-test-0701',
      
      // Class information
      class_name: 'TypeScript SDK Test Class',
      school_name: 'Carnegie Mellon University',
      instructor_name: 'Test Instructor',
      period_name: 'Fall 2024',
      class_description: 'Integration test for TypeScript SDK',
      
      // Problem information
      problem_name: 'SDK_Test_Problem_' + new Date().getTime(),
      problem_context: 'Testing all features of the TypeScript SDK'
    }
  });

  // Set multiple dataset levels
  logger.setDatasetLevelName(1, 'Module');
  logger.setDatasetLevelType(1, 'Module');
  logger.setDatasetLevelName(2, 'Unit');
  logger.setDatasetLevelType(2, 'Unit');
  logger.setDatasetLevelName(3, 'Section');
  logger.setDatasetLevelType(3, 'Section');

  // Add log listener to see what's being sent
  let messageCount = 0;
  logger.setLogListener((message) => {
    messageCount++;
    console.log(`\n--- Message ${messageCount} sent to DataShop ---`);
    // Show a snippet of the message
    const preview = message.substring(0, 200) + '...';
    console.log(preview);
  });

  // Start session
  console.log('Starting session...');
  const sessionId = logger.start();
  console.log(`Session ID: ${sessionId}\n`);

  // Test 1: Simple correct attempt
  console.log('Test 1: Simple correct attempt');
  const tx1 = logger.logInterfaceAttempt(
    'answer_field',
    'setValue',
    '42',
    {
      question: 'What is 6 × 7?',
      attemptNumber: 1,
      timestamp: new Date().toISOString()
    }
  );

  // Log correct response with skills
  const skills1: Skill[] = [
    { name: 'multiplication', category: 'arithmetic' },
    { name: 'single-digit-multiplication', category: 'arithmetic' }
  ];

  logger.logResponse(
    tx1,
    'answer_field',
    'setValue',
    '42',
    'RESULT',
    {
      evaluation: 'CORRECT',
      classification: 'correct-on-first-attempt'
    },
    'Excellent! 6 × 7 = 42',
    { responseTime: 1500 },
    skills1
  );

  // Test 2: Incorrect attempt followed by hint
  console.log('\nTest 2: Incorrect attempt with hint');
  const tx2 = logger.logInterfaceAttempt(
    'equation_solver',
    'solveFor',
    'x = 3',
    {
      equation: '2x + 4 = 10',
      attemptNumber: 1
    }
  );

  logger.logResponse(
    tx2,
    'equation_solver',
    'solveFor',
    'x = 3',
    'RESULT',
    'INCORRECT',
    'Not quite. Remember to isolate x on one side.',
    { errorType: 'arithmetic' }
  );

  // Hint request
  console.log('Student requests hint...');
  const hintTx = logger.logInterfaceHintRequest(
    'hint_button',
    'click',
    '',
    { afterAttempts: 1 }
  );

  logger.logHintResponse(
    hintTx,
    'hint_button',
    'click',
    '',
    1,
    3,
    'Start by subtracting 4 from both sides of the equation.',
    { hintLevel: 'procedural' }
  );

  // Test 3: Multi-step problem with KC tracking
  console.log('\nTest 3: Multi-step problem');
  
  // Step 1
  const step1Tx = logger.logInterfaceAttempt(
    ['step1_field', 'workspace'],
    'enterStep',
    '2x + 4 - 4 = 10 - 4',
    {
      stepNumber: 1,
      problemId: 'algebra_001'
    }
  );

  const step1Skills: Skill[] = [
    { name: 'subtract-from-both-sides', category: 'algebra' },
    { name: 'equation-balance', category: 'algebra' }
  ];

  logger.logResponse(
    step1Tx,
    ['step1_field', 'workspace'],
    'enterStep',
    '2x + 4 - 4 = 10 - 4',
    'RESULT',
    'CORRECT',
    'Good! You correctly subtracted 4 from both sides.',
    { stepScore: 1 },
    step1Skills
  );

  // Step 2
  const step2Tx = logger.logInterfaceAttempt(
    ['step2_field', 'workspace'],
    'enterStep',
    '2x = 6',
    {
      stepNumber: 2,
      problemId: 'algebra_001'
    }
  );

  logger.logResponse(
    step2Tx,
    ['step2_field', 'workspace'],
    'enterStep',
    '2x = 6',
    'RESULT',
    'CORRECT',
    'Excellent simplification!',
    { stepScore: 1 }
  );

  // Final answer
  const finalTx = logger.logInterfaceAttempt(
    'final_answer',
    'submit',
    'x = 3',
    {
      stepNumber: 3,
      problemId: 'algebra_001',
      totalTime: 45000
    }
  );

  const finalSkills: Skill[] = [
    { name: 'divide-both-sides', category: 'algebra' },
    { name: 'solve-linear-equation', category: 'algebra' },
    { name: 'check-solution', category: 'problem-solving' }
  ];

  logger.logResponse(
    finalTx,
    'final_answer',
    'submit',
    'x = 3',
    'RESULT',
    {
      evaluation: 'CORRECT',
      classification: 'correct-after-hint'
    },
    'Perfect! You solved the equation correctly. x = 3 is the right answer.',
    { 
      totalScore: 3,
      hintsUsed: 1,
      attemptsBeforeCorrect: 2
    },
    finalSkills
  );

  // Test 4: Test getLastSAI
  console.log('\nTest 4: Testing getLastSAI()');
  const lastSAI = logger.getLastSAI();
  console.log('Last SAI:', JSON.stringify(lastSAI, null, 2));

  // Test 5: Custom semantic event
  console.log('\nTest 5: Custom semantic event');
  logger.logInterfaceAttempt(
    'next_problem_button',
    'click',
    'next',
    {
      completedProblems: 1,
      eventType: 'navigation'
    }
  );

  // End session
  console.log('\nEnding session...');
  logger.endSession();

  console.log('\n=== Integration Test Complete ===');
  console.log(`Total messages sent: ${messageCount}`);
  console.log('\nCheck the DataShop QA server for the logged data:');
  console.log('Dataset: eason-test-0701');
  console.log(`Session ID: ${sessionId}`);
  console.log('\nNote: It may take a few minutes for the data to appear in DataShop.');
}

// Run the test
runIntegrationTest().catch(console.error);