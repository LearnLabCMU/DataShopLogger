/**
 * Example using the new object-based API
 * This demonstrates cleaner, more maintainable code with named parameters
 */

import { DataShopLogger } from '../src';
import type { Skill } from '../src';

async function demonstrateObjectAPI() {
  console.log('=== DataShop Logger Object-Based API Example ===\n');

  // Initialize logger with production server
  const logger = new DataShopLogger({
    configuration: {
      log_service_url: 'https://learnlab.web.cmu.edu/log/server',
      dataset_name: 'eason-test-1',
      problem_name: 'Object_API_Demo_' + Date.now(),
      user_guid: 'demo-user-001'
    }
  });

  // Configure using object parameters
  logger.setLogClassName({ className: 'Math 101' });
  logger.setSchool({ school: 'Carnegie Mellon University' });
  logger.setInstructor({ instructor: 'Dr. Smith' });
  logger.setProblemContext({ context: 'Demonstrating new object-based API' });

  // Set dataset levels with clear parameter names
  logger.setDatasetLevelName({ level: 1, name: 'Mathematics' });
  logger.setDatasetLevelType({ level: 1, type: 'Subject' });
  logger.setDatasetLevelName({ level: 2, name: 'Algebra' });
  logger.setDatasetLevelType({ level: 2, type: 'Course' });

  // Add log listener
  logger.setLogListener({
    listener: (message) => {
      console.log(`Sent ${message.length} bytes to DataShop`);
    }
  });

  // Start session
  const sessionId = logger.start();
  console.log(`\nSession started: ${sessionId}\n`);

  // Example 1: Math problem with clear parameter names
  console.log('1. Logging a math problem attempt:');
  const mathAttemptId = logger.logInterfaceAttempt({
    selection: 'answer_input',
    action: 'setValue',
    input: '15',
    customFields: {
      problem: '3 × 5 = ?',
      difficulty: 'easy',
      timestamp: new Date().toISOString()
    }
  });

  // Define skills being assessed
  const mathSkills: Skill[] = [
    { 
      name: 'multiplication-facts', 
      category: 'arithmetic',
      opportunities: 5
    }
  ];

  // Log response with clear parameter structure
  logger.logResponse({
    transactionId: mathAttemptId,
    selection: 'answer_input',
    action: 'setValue',
    input: '15',
    semanticName: 'RESULT',
    evaluation: {
      evaluation: 'CORRECT',
      classification: 'immediate-correct'
    },
    advice: 'Excellent! 3 × 5 = 15',
    customFields: {
      responseTime: 3000,
      attemptNumber: 1
    },
    skills: mathSkills
  });

  // Example 2: Hint request and response
  console.log('\n2. Logging a hint interaction:');
  const hintRequestId = logger.logInterfaceHintRequest({
    selection: 'hint_button',
    action: 'click',
    input: '',
    customFields: {
      problemId: 'algebra_01',
      afterAttempts: 2
    }
  });

  logger.logHintResponse({
    transactionId: hintRequestId,
    selection: 'hint_button',
    action: 'click',
    input: '',
    currentHintNumber: 1,
    totalHintsAvailable: 3,
    hintText: 'Try isolating the variable on one side of the equation.',
    customFields: {
      hintLevel: 'strategic'
    }
  });

  // Example 3: Using SAI object
  console.log('\n3. Using SAI object for complex interactions:');
  const complexAttemptId = logger.logInterfaceAttemptSAI({
    sai: {
      selection: ['cell_A1', 'cell_B1', 'cell_C1'],
      action: ['select', 'select', 'select'],
      input: ['5', '10', '15']
    },
    customFields: {
      activityType: 'spreadsheet',
      operation: 'multi-cell-entry'
    }
  });

  const spreadsheetSkills: Skill[] = [
    { name: 'spreadsheet-navigation', category: 'computer-skills' },
    { name: 'data-entry', category: 'computer-skills' }
  ];

  logger.logResponseSAI({
    transactionId: complexAttemptId,
    sai: {
      selection: ['cell_A1', 'cell_B1', 'cell_C1'],
      action: ['select', 'select', 'select'],
      input: ['5', '10', '15']
    },
    semanticName: 'RESULT',
    evaluation: 'CORRECT',
    advice: 'Good job entering the sequence!',
    skills: spreadsheetSkills
  });

  // Example 4: Wrong answer with detailed evaluation
  console.log('\n4. Logging incorrect attempt with detailed feedback:');
  const wrongAttemptId = logger.logInterfaceAttempt({
    selection: 'equation_solver',
    action: 'solve',
    input: 'x = 2',
    customFields: {
      equation: '2x + 4 = 10',
      method: 'mental-math'
    }
  });

  logger.logResponse({
    transactionId: wrongAttemptId,
    selection: 'equation_solver',
    action: 'solve',
    input: 'x = 2',
    semanticName: 'RESULT',
    evaluation: {
      evaluation: 'INCORRECT',
      classification: 'computational-error',
      currentHintNumber: 0,
      totalHintsAvailable: 2
    },
    advice: 'Not quite. Check your arithmetic: if x = 2, then 2(2) + 4 = 8, not 10.',
    customFields: {
      errorType: 'arithmetic',
      expectedAnswer: 'x = 3'
    }
  });

  // Get last SAI
  const lastSAI = logger.getLastSAI();
  console.log('\n5. Last SAI recorded:', JSON.stringify(lastSAI, null, 2));

  // End session
  logger.endSession();
  console.log('\n✅ Session ended successfully');
  console.log('\nThe object-based API provides:');
  console.log('- Clear parameter names (no more guessing parameter order)');
  console.log('- Better IDE autocomplete support');
  console.log('- Easier to extend with new optional parameters');
  console.log('- More maintainable code');
  console.log('\n📊 Data logged to dataset: eason-test-1');
}

// Run the demonstration
demonstrateObjectAPI().catch(console.error);