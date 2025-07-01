/**
 * Test logging to specific dataset: eason-test-1
 * This test logs data to the DataShop QA server
 */

import { DataShopLogger } from '../src';
import type { Skill } from '../src';

async function testEasonDataset() {
  console.log('=== Testing DataShop Logger with eason-test-1 dataset ===\n');

  // Initialize logger with specific dataset
  const logger = new DataShopLogger({
    configuration: {
      // Use production server
      log_service_url: 'https://learnlab.web.cmu.edu/log/server',
      
      // Specific dataset configuration
      dataset_name: 'eason-test-1',  // The specific dataset within the project
      
      // Class information
      class_name: 'Test Class for eason-test-1',
      school_name: 'Carnegie Mellon University',
      instructor_name: 'Test Instructor',
      period_name: 'Winter 2025',
      class_description: 'Testing TypeScript SDK with eason-test-1 dataset',
      
      // Problem information
      problem_name: 'TypeScript_SDK_Test_' + new Date().getTime(),
      problem_context: 'Testing all TypeScript SDK features',
      
      // User identification
      user_guid: 'test-user-' + Math.random().toString(36).substring(7)
    }
  });

  // Set up hierarchical dataset levels
  logger.setDatasetLevelName(1, 'TypeScript SDK Tests');
  logger.setDatasetLevelType(1, 'TestSuite');
  logger.setDatasetLevelName(2, 'Feature Tests');
  logger.setDatasetLevelType(2, 'TestCategory');
  logger.setDatasetLevelName(3, 'Integration Test');
  logger.setDatasetLevelType(3, 'TestType');

  // Track messages sent
  let messageCount = 0;
  logger.setLogListener((message) => {
    messageCount++;
    console.log(`Message ${messageCount} sent (${message.length} bytes)`);
  });

  // Start session
  console.log('Starting logging session...');
  const sessionId = logger.start();
  console.log(`Session ID: ${sessionId}\n`);

  // Test 1: Basic math problem with skills
  console.log('Test 1: Math problem with knowledge components');
  const mathAttempt = logger.logInterfaceAttempt(
    'math_input',
    'calculate',
    '25',
    {
      problem: '5 × 5',
      problemType: 'multiplication',
      timestamp: new Date().toISOString()
    }
  );

  const mathSkills: Skill[] = [
    { 
      name: 'multiplication-single-digit', 
      category: 'arithmetic',
      opportunities: 10,
      predicted_error_rate: 0.05
    },
    { 
      name: 'multiplication-facts-5', 
      category: 'arithmetic',
      opportunities: 3
    }
  ];

  logger.logResponse(
    mathAttempt,
    'math_input',
    'calculate',
    '25',
    'RESULT',
    {
      evaluation: 'CORRECT',
      classification: 'correct-first-attempt'
    },
    'Perfect! 5 × 5 = 25',
    {
      responseTimeMs: 2500,
      confidence: 0.95
    },
    mathSkills
  );

  // Test 2: Science question with hint
  console.log('\nTest 2: Science question with hint request');
  const scienceAttempt = logger.logInterfaceAttempt(
    'science_answer',
    'submit',
    'Mercury',
    {
      question: 'What is the closest planet to the Sun?',
      subject: 'astronomy'
    }
  );

  logger.logResponse(
    scienceAttempt,
    'science_answer',
    'submit',
    'Mercury',
    'RESULT',
    'INCORRECT',
    'Not quite. Think about which planet has the shortest orbit.',
    { attemptNumber: 1 }
  );

  // Student requests hint
  console.log('Student requesting hint...');
  const hintRequest = logger.logInterfaceHintRequest(
    'hint_button',
    'click',
    '',
    { questionId: 'astronomy_01' }
  );

  logger.logHintResponse(
    hintRequest,
    'hint_button',
    'click',
    '',
    1,
    2,
    'This planet is also the smallest in our solar system and has no atmosphere.',
    { hintType: 'descriptive' }
  );

  // Test 3: Multi-step algebra problem
  console.log('\nTest 3: Multi-step algebra problem');
  
  // Step 1: Simplify
  const step1 = logger.logInterfaceAttempt(
    ['algebra_workspace', 'step1'],
    'simplify',
    '3x + 12 = 27',
    {
      originalEquation: '3(x + 4) = 27',
      stepNumber: 1
    }
  );

  const algebraSkills1: Skill[] = [
    { name: 'distributive-property', category: 'algebra' },
    { name: 'equation-manipulation', category: 'algebra' }
  ];

  logger.logResponse(
    step1,
    ['algebra_workspace', 'step1'],
    'simplify',
    '3x + 12 = 27',
    'RESULT',
    'CORRECT',
    'Good! You correctly applied the distributive property.',
    { stepScore: 1 },
    algebraSkills1
  );

  // Step 2: Isolate variable
  const step2 = logger.logInterfaceAttempt(
    ['algebra_workspace', 'step2'],
    'isolate',
    '3x = 15',
    {
      stepNumber: 2,
      operation: 'subtract 12 from both sides'
    }
  );

  logger.logResponse(
    step2,
    ['algebra_workspace', 'step2'],
    'isolate',
    '3x = 15',
    'RESULT',
    'CORRECT',
    'Excellent! You isolated the term with x.',
    { stepScore: 1 }
  );

  // Final answer
  const finalAnswer = logger.logInterfaceAttempt(
    'final_answer_field',
    'solve',
    'x = 5',
    {
      stepNumber: 3,
      totalTime: 120000
    }
  );

  const algebraSkillsFinal: Skill[] = [
    { name: 'solving-linear-equations', category: 'algebra' },
    { name: 'algebraic-reasoning', category: 'problem-solving' }
  ];

  logger.logResponse(
    finalAnswer,
    'final_answer_field',
    'solve',
    'x = 5',
    'RESULT',
    {
      evaluation: 'CORRECT',
      classification: 'multi-step-correct'
    },
    'Outstanding! You solved the equation correctly. x = 5 is the solution.',
    {
      totalScore: 3,
      problemComplete: true,
      masteryLevel: 0.85
    },
    algebraSkillsFinal
  );

  // Test 4: Reading comprehension
  console.log('\nTest 4: Reading comprehension');
  const readingAttempt = logger.logInterfaceAttempt(
    'reading_response',
    'analyze',
    'The main theme is perseverance',
    {
      passageId: 'passage_001',
      questionType: 'theme-identification'
    }
  );

  const readingSkills: Skill[] = [
    { 
      name: 'theme-identification', 
      category: 'reading-comprehension',
      opportunities: 5
    },
    { 
      name: 'textual-analysis', 
      category: 'critical-thinking'
    }
  ];

  logger.logResponse(
    readingAttempt,
    'reading_response',
    'analyze',
    'The main theme is perseverance',
    'RESULT',
    'CORRECT',
    'Excellent analysis! You correctly identified the theme of perseverance in the text.',
    {
      rubricScore: 4,
      maxScore: 4
    },
    readingSkills
  );

  // Test 5: Navigation event
  console.log('\nTest 5: Navigation to next problem');
  logger.logInterfaceAttempt(
    'navigation_button',
    'navigate',
    'next_problem',
    {
      completedProblems: 4,
      currentScore: 15,
      maxScore: 16
    }
  );

  // Get last SAI
  const lastSAI = logger.getLastSAI();
  console.log('\nLast SAI logged:', JSON.stringify(lastSAI, null, 2));

  // End session
  console.log('\nEnding session...');
  logger.endSession();

  // Summary
  console.log('\n=== Test Complete ===');
  console.log(`Dataset: eason-test-1`);
  console.log(`Session ID: ${sessionId}`);
  console.log(`Total messages sent: ${messageCount}`);
  console.log('\nAll messages have been sent to DataShop QA server.');
  console.log('Check https://pslc-qa.andrew.cmu.edu for the logged data.');
  console.log('\nNote: Data may take a few minutes to appear in DataShop.');
}

// Run the test
console.log('DataShop Logger Test for eason-test-1 dataset');
console.log('='.repeat(50));
testEasonDataset().catch(console.error);