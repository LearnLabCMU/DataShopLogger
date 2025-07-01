/**
 * Verify XML output format for DataShop Logger
 * This shows the complete XML messages being generated
 */

import { DataShopLogger } from '../src';
import type { Skill } from '../src';

function runXMLVerification() {
  console.log('=== DataShop Logger XML Verification ===\n');

  // Initialize logger
  const logger = new DataShopLogger({
    configuration: {
      log_service_url: 'https://pslc-qa.andrew.cmu.edu/log/server',
      dataset_name: 'eason-test-0701',
      class_name: 'Test Class',
      school_name: 'CMU',
      instructor_name: 'Test Teacher',
      problem_name: 'XML_Test_' + Date.now(),
      problem_context: 'Verifying XML format',
      user_guid: 'test-user-123'
    }
  });

  // Set multiple dataset levels
  logger.setDatasetLevelName(1, 'Course');
  logger.setDatasetLevelType(1, 'Course');
  logger.setDatasetLevelName(2, 'Unit');
  logger.setDatasetLevelType(2, 'Unit');
  logger.setDatasetLevelName(3, 'Problem Set');
  logger.setDatasetLevelType(3, 'ProblemSet');

  // Capture full XML messages
  const messages: string[] = [];
  logger.setLogListener((message) => {
    messages.push(message);
  });

  // Start session
  const sessionId = logger.start();

  // Log an attempt with skills
  const txId = logger.logInterfaceAttempt(
    'answer_field',
    'setValue',
    '42',
    {
      customField1: 'value1',
      customField2: 123
    }
  );

  // Define skills
  const skills: Skill[] = [
    { name: 'multiplication', category: 'arithmetic' },
    { name: 'problem-solving', category: 'general' }
  ];

  // Log response with skills
  logger.logResponse(
    txId,
    'answer_field',
    'setValue',
    '42',
    'RESULT',
    {
      evaluation: 'CORRECT',
      classification: 'first-attempt',
      currentHintNumber: 0,
      totalHintsAvailable: 3
    },
    'Great job!',
    { responseTime: 1500 },
    skills
  );

  // Print all messages with formatting
  console.log('Generated XML Messages:\n');
  messages.forEach((msg, index) => {
    console.log(`\n=== Message ${index + 1} ===`);
    // Pretty print XML
    const formatted = msg
      .replace(/></g, '>\n<')
      .split('\n')
      .map(line => {
        const indent = (line.match(/^<\//) ? -1 : 0) + 
                      (line.split('<').length - line.split('>').length - 1);
        return '  '.repeat(Math.max(0, indent)) + line;
      })
      .join('\n');
    console.log(formatted);
  });

  console.log(`\n\nSession ID: ${sessionId}`);
  console.log('Total messages: ' + messages.length);
}

// Run verification
runXMLVerification();