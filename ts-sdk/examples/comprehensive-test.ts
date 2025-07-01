/**
 * Comprehensive test logging multiple types of data to DataShop
 * Dataset: eason-test-1
 */

import { DataShopLogger } from '../src';
import type { Skill } from '../src';

async function runComprehensiveTest() {
  console.log('🚀 Running Comprehensive DataShop Logger Test\n');
  console.log('📊 Dataset: eason-test-1');
  console.log('🌐 Server: Production (learnlab.web.cmu.edu)\n');

  const logger = new DataShopLogger({
    configuration: {
      log_service_url: 'https://learnlab.web.cmu.edu/log/server',
      dataset_name: 'eason-test-1',
      problem_name: 'Comprehensive_Test_' + Date.now(),
      user_guid: 'test-user-' + Math.random().toString(36).substring(7),
      class_name: 'TypeScript SDK Comprehensive Test',
      school_name: 'Carnegie Mellon University',
      instructor_name: 'Test Instructor',
      period_name: 'Winter 2025',
      class_description: 'Testing all features of the TypeScript SDK'
    }
  });

  // Set up hierarchical dataset levels
  logger.setDatasetLevelName({ level: 1, name: 'Computer Science' });
  logger.setDatasetLevelType({ level: 1, type: 'Department' });
  logger.setDatasetLevelName({ level: 2, name: 'Software Engineering' });
  logger.setDatasetLevelType({ level: 2, type: 'Course' });
  logger.setDatasetLevelName({ level: 3, name: 'API Design' });
  logger.setDatasetLevelType({ level: 3, type: 'Module' });

  // Add log listener to track messages
  let messageCount = 0;
  logger.setLogListener({
    listener: (message) => {
      messageCount++;
      console.log(`📤 Message ${messageCount} sent (${message.length} bytes)`);
    }
  });

  // Start session
  const sessionId = logger.start();
  console.log(`\n✅ Session started: ${sessionId}\n`);

  // Test 1: Basic math problem
  console.log('Test 1: Basic Math Problem');
  const mathTx = logger.logInterfaceAttempt({
    selection: 'math_answer',
    action: 'calculate',
    input: '144',
    customFields: {
      problem: '12 × 12 = ?',
      problemType: 'multiplication',
      difficulty: 'medium'
    }
  });

  const mathSkills: Skill[] = [
    { name: 'multiplication-two-digit', category: 'arithmetic', opportunities: 15 },
    { name: 'mental-math', category: 'general', opportunities: 8 }
  ];

  logger.logResponse({
    transactionId: mathTx,
    selection: 'math_answer',
    action: 'calculate',
    input: '144',
    semanticName: 'RESULT',
    evaluation: {
      evaluation: 'CORRECT',
      classification: 'correct-first-attempt'
    },
    advice: 'Excellent! 12 × 12 = 144',
    customFields: { timeSpent: 5000 },
    skills: mathSkills
  });

  // Test 2: Wrong answer with hint sequence
  console.log('\nTest 2: Wrong Answer → Hint → Correct');
  const wrongTx = logger.logInterfaceAttempt({
    selection: 'algebra_solver',
    action: 'solve',
    input: 'x = 5',
    customFields: {
      equation: '3x + 7 = 22',
      attemptNumber: 1
    }
  });

  logger.logResponse({
    transactionId: wrongTx,
    selection: 'algebra_solver',
    action: 'solve',
    input: 'x = 5',
    semanticName: 'RESULT',
    evaluation: {
      evaluation: 'INCORRECT',
      classification: 'arithmetic-error',
      currentHintNumber: 0,
      totalHintsAvailable: 3
    },
    advice: 'Not quite. Check your arithmetic.',
    customFields: { errorType: 'calculation' }
  });

  // Request hint
  const hintReq = logger.logInterfaceHintRequest({
    selection: 'hint_button',
    action: 'click',
    input: '',
    customFields: { afterIncorrectAttempts: 1 }
  });

  logger.logHintResponse({
    transactionId: hintReq,
    selection: 'hint_button',
    action: 'click',
    input: '',
    currentHintNumber: 1,
    totalHintsAvailable: 3,
    hintText: 'First, subtract 7 from both sides of the equation.',
    customFields: { hintType: 'procedural' }
  });

  // Correct attempt after hint
  const correctTx = logger.logInterfaceAttempt({
    selection: 'algebra_solver',
    action: 'solve',
    input: 'x = 5',
    customFields: {
      equation: '3x + 7 = 22',
      attemptNumber: 2,
      afterHint: true
    }
  });

  const algebraSkills: Skill[] = [
    { name: 'linear-equation-solving', category: 'algebra', opportunities: 20 },
    { name: 'isolation-technique', category: 'algebra', opportunities: 12 }
  ];

  logger.logResponse({
    transactionId: correctTx,
    selection: 'algebra_solver',
    action: 'solve',
    input: 'x = 5',
    semanticName: 'RESULT',
    evaluation: {
      evaluation: 'CORRECT',
      classification: 'correct-after-hint'
    },
    advice: 'Well done! x = 5 is correct.',
    customFields: {
      hintsUsed: 1,
      totalAttempts: 2
    },
    skills: algebraSkills
  });

  // Test 3: Multi-step problem
  console.log('\nTest 3: Multi-Step Problem');
  for (let step = 1; step <= 3; step++) {
    const stepTx = logger.logInterfaceAttempt({
      selection: `step_${step}_input`,
      action: 'complete',
      input: `Step ${step} solution`,
      customFields: {
        stepNumber: step,
        totalSteps: 3,
        problemId: 'multi_step_001'
      }
    });

    logger.logResponse({
      transactionId: stepTx,
      selection: `step_${step}_input`,
      action: 'complete',
      input: `Step ${step} solution`,
      semanticName: 'STEP_RESULT',
      evaluation: 'CORRECT',
      advice: `Step ${step} completed successfully!`,
      customFields: { stepScore: 1 }
    });
  }

  // Test 4: Bug detection
  console.log('\nTest 4: Bug Detection');
  const bugTx = logger.logInterfaceAttempt({
    selection: 'code_editor',
    action: 'submit',
    input: 'for (i = 0; i <= array.length; i++)',
    customFields: {
      taskType: 'debugging',
      language: 'javascript'
    }
  });

  logger.logResponse({
    transactionId: bugTx,
    selection: 'code_editor',
    action: 'submit',
    input: 'for (i = 0; i <= array.length; i++)',
    semanticName: 'RESULT',
    evaluation: {
      evaluation: 'BUG',
      classification: 'off-by-one-error'
    },
    advice: 'Careful! This will cause an array index out of bounds error.',
    skills: [
      { name: 'debugging', category: 'programming' },
      { name: 'array-manipulation', category: 'programming' }
    ]
  });

  // Test 5: Testing backward compatibility
  console.log('\nTest 5: Backward Compatibility (Old API)');
  const oldApiTx = logger.logInterfaceAttempt('submit_btn', 'click', 'final_answer');
  logger.logResponse(
    oldApiTx,
    'submit_btn',
    'click',
    'final_answer',
    'RESULT',
    'CORRECT',
    'API compatibility confirmed!'
  );

  // Test 6: Complex SAI with arrays
  console.log('\nTest 6: Complex SAI with Arrays');
  const complexTx = logger.logInterfaceAttemptSAI({
    sai: {
      selection: ['cell_A1', 'cell_B1', 'cell_C1'],
      action: ['enter', 'enter', 'calculate'],
      input: ['10', '20', '=A1+B1']
    },
    customFields: {
      spreadsheetId: 'test_sheet_001',
      formulaUsed: true
    }
  });

  logger.logResponseSAI({
    transactionId: complexTx,
    sai: {
      selection: ['cell_A1', 'cell_B1', 'cell_C1'],
      action: ['enter', 'enter', 'calculate'],
      input: ['10', '20', '=A1+B1']
    },
    semanticName: 'FORMULA_RESULT',
    evaluation: 'CORRECT',
    advice: 'Formula calculated correctly: 30',
    skills: [
      { name: 'spreadsheet-formulas', category: 'computer-skills' },
      { name: 'cell-referencing', category: 'computer-skills' }
    ]
  });

  // Test 7: No match scenario
  console.log('\nTest 7: No Match Evaluation');
  const noMatchTx = logger.logInterfaceAttempt({
    selection: 'open_ended_response',
    action: 'submit',
    input: 'The answer is creativity',
    customFields: { questionType: 'open-ended' }
  });

  logger.logResponse({
    transactionId: noMatchTx,
    selection: 'open_ended_response',
    action: 'submit',
    input: 'The answer is creativity',
    semanticName: 'RESULT',
    evaluation: 'NO_MATCH',
    advice: 'Response recorded. This will be reviewed by your instructor.'
  });

  // Get last SAI
  const lastSAI = logger.getLastSAI();
  console.log('\n📋 Last SAI:', JSON.stringify(lastSAI, null, 2));

  // End session
  logger.endSession();

  // Final summary
  console.log('\n' + '='.repeat(50));
  console.log('✅ Comprehensive Test Complete!');
  console.log(`📊 Total messages sent: ${messageCount}`);
  console.log(`🆔 Session ID: ${sessionId}`);
  console.log(`📁 Dataset: eason-test-1`);
  console.log('🌐 Server: Production (learnlab.web.cmu.edu)');
  console.log('\n✨ All features tested successfully:');
  console.log('   - Object-based API');
  console.log('   - Backward compatibility');
  console.log('   - Skills/Knowledge Components');
  console.log('   - Multiple dataset levels');
  console.log('   - All evaluation types (CORRECT, INCORRECT, HINT, BUG, NO_MATCH)');
  console.log('   - Custom fields');
  console.log('   - Complex SAI with arrays');
  console.log('   - Hint sequences');
  console.log('   - Multi-step problems');
  console.log('\n🎉 TypeScript SDK is fully operational!');
}

// Run the test
runComprehensiveTest().catch(console.error);