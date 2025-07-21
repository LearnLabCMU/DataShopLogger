# DataShop Logger TypeScript SDK

A TypeScript SDK for logging educational data to Carnegie Mellon University's DataShop system. This library provides a type-safe, modern interface for educational applications to log student interactions and tutor responses.

## Features

- 🔒 **Type-Safe**: Full TypeScript support with comprehensive type definitions
- 🚀 **Modern**: Built with ES2020+ features and module support
- 📦 **Zero Dependencies**: No runtime dependencies for lightweight integration
- 🧪 **Well-Tested**: Extensive test coverage (>95%)
- 🌐 **Universal**: Works in both Node.js and browser environments
- 📝 **Documented**: Comprehensive API documentation with examples
- 🎯 **Knowledge Component Support**: Track learning objectives with Skills/KC
- 📊 **Hierarchical Datasets**: Support for multiple dataset levels
- ⚙️ **Full Feature Parity**: All features from JavaScript version included
- 🔄 **Session Persistence**: Resume sessions across page refreshes/route changes

## Installation

```bash
npm install @learnlab/datashop-logger
```

or

```bash
yarn add @learnlab/datashop-logger
```

## Quick Start

```typescript
import { DataShopLogger } from '@learnlab/datashop-logger';

// Initialize the logger
const logger = new DataShopLogger({
  configuration: {
    log_service_url: 'https://learnlab.web.cmu.edu/log/server',
    dataset_name: 'MyEducationalApp',
    problem_name: 'Lesson1',
    user_guid: 'student123'
  }
});

// Start a logging session
const sessionId = logger.start();
console.log(`Started session: ${sessionId}`);

// Log a student action (NEW object-based API)
const transactionId = logger.logInterfaceAttempt({
  selection: 'submit_button',
  action: 'click',
  input: 'answer42',
  customFields: {
    attemptNumber: 1,
    timestamp: Date.now()
  }
});

// Log the tutor's response
logger.logResponse({
  transactionId: transactionId,
  selection: 'submit_button',
  action: 'click',
  input: 'answer42',
  semanticName: 'RESULT',
  evaluation: 'CORRECT',
  advice: 'Great job! That\'s the right answer.',
  skills: [
    { name: 'problem-solving', category: 'general' }
  ]
});
```

## API Reference

### Constructor Options

```typescript
interface LoggingLibraryOptions {
  configuration?: LogConfiguration;
  logFormat?: 'DATASHOP' | 'XAPI';  // Default: 'DATASHOP'
  useSessionLog?: boolean;            // Default: true
}
```

### Configuration

```typescript
interface LogConfiguration {
  // Required for logging
  log_service_url?: string;         // DataShop server URL
  
  // Session identification
  session_id?: string;              // Auto-generated if not provided
  context_message_id?: string;      // Auto-generated if not provided
  user_guid?: string;               // Auto-generated if not provided
  
  // Course/class information
  class_name?: string;
  school_name?: string;
  period_name?: string;
  class_description?: string;
  instructor_name?: string;
  
  // Dataset information
  dataset_name?: string;            // Default: 'UnassignedDataset'
  
  // Multiple dataset levels (up to 10)
  dataset_level_name1?: string;
  dataset_level_type1?: string;
  dataset_level_name2?: string;
  dataset_level_type2?: string;
  // ... up to dataset_level_name10/type10
  
  // Problem information
  problem_name?: string;
  problem_context?: string;
  
  // Other options
  context_name?: string;            // Default: 'START_PROBLEM'
  source_id?: string;              // Default: 'tutor'
}
```

### Main Methods

#### Starting a Session

```typescript
// Start logging session and send context message
const sessionId = logger.start();

// Or use the convenience methods
logger.setLoggingURLQA();        // Use QA server
logger.setLoggingURLProduction(); // Use production server
```

#### Logging Student Actions

```typescript
// NEW: Object-based API (recommended)
const txId = logger.logInterfaceAttempt({
  selection: 'input_field',
  action: 'setValue',
  input: '42',
  customFields: {
    skill: 'arithmetic',
    difficulty: 'medium'
  }
});

// Using SAI object
const txId = logger.logInterfaceAttemptSAI({
  sai: {
    selection: ['cell_A1', 'cell_B1'],
    action: 'sum',
    input: '=A1+B1'
  },
  customFields: {
    worksheet: 'Sheet1'
  }
});

// Legacy API (still supported for backward compatibility)
const txId = logger.logInterfaceAttempt('input_field', 'setValue', '42');
```

#### Logging Hint Requests

```typescript
// NEW: Object-based API
const hintTxId = logger.logInterfaceHintRequest({
  selection: 'hint_button',
  action: 'click',
  input: '',
  customFields: {
    problemId: 'prob_001'
  }
});

// System provides hint
logger.logHintResponse({
  transactionId: hintTxId,
  selection: 'hint_button',
  action: 'click',
  input: '',
  currentHintNumber: 1,
  totalHintsAvailable: 3,
  hintText: 'Try adding the numbers in column A first.',
  customFields: {
    hintType: 'strategic'
  }
});
```

#### Logging Tutor Responses

```typescript
// NEW: Object-based API with clear parameter names
logger.logResponse({
  transactionId: transactionId,
  selection: 'submit_button',
  action: 'click',
  input: 'answer',
  semanticName: 'RESULT',
  evaluation: 'CORRECT',  // or 'INCORRECT', 'HINT', 'BUG', 'NO_MATCH'
  advice: 'Well done!'
});

// Detailed evaluation with all features
logger.logResponse({
  transactionId: transactionId,
  selection: 'submit_button',
  action: 'click',
  input: 'answer',
  semanticName: 'RESULT',
  evaluation: {
    evaluation: 'INCORRECT',
    classification: 'arithmetic-error',
    currentHintNumber: 0,
    totalHintsAvailable: 3
  },
  advice: 'Not quite. Check your calculation.',
  customFields: {
    responseTime: 1500,
    attemptNumber: 2
  },
  skills: [
    { name: 'addition', category: 'arithmetic' },
    { name: 'carrying', category: 'arithmetic' }
  ]
});
```

### Configuration Methods

```typescript
// NEW: Object-based configuration API
logger.setUserID({ id: 'student456' });
logger.setProblemName({ name: 'Lesson2' });
logger.setProblemContext({ context: 'Advanced arithmetic problems' });
logger.setDatasetName({ name: 'MathTutor2024' });
logger.setSchool({ school: 'Carnegie Mellon University' });
logger.setPeriod({ period: 'Spring 2024' });
logger.setInstructor({ instructor: 'Dr. Smith' });
logger.setDescription({ description: 'Introduction to Algebra' });
logger.setLogClassName({ className: 'MATH101' });

// Set multiple dataset levels with clear parameters
logger.setDatasetLevelName({ level: 1, name: 'Course' });
logger.setDatasetLevelType({ level: 1, type: 'Course' });
logger.setDatasetLevelName({ level: 2, name: 'Unit' });
logger.setDatasetLevelType({ level: 2, type: 'Unit' });
logger.setDatasetLevelName({ level: 3, name: 'Lesson' });
logger.setDatasetLevelType({ level: 3, type: 'Lesson' });

// Context management
logger.setContextName({ name: 'PROBLEM_STARTED' });
logger.setContextMessageID({ id: 'C123456' });
const contextId = logger.getContextMessageID();
const contextName = logger.getContextName();

// Session management
logger.setUseSessionLog({ use: true });  // Enable/disable session log messages
const lastSAI = logger.getLastSAI();  // Get the last logged SAI

// End session (generates new session ID for next use)
logger.endSession();
```

## Advanced Usage

### Custom Log Listener

```typescript
// Add a listener to receive all logged messages
logger.setLogListener({
  listener: (message: string) => {
    console.log('Logged:', message);
    // You can save to file, send to another service, etc.
  }
});
```

### Using SAI Builder

```typescript
import { SAIBuilder } from '@learnlab/datashop-logger';

const builder = new SAIBuilder()
  .setSelection(['cell_A1', 'cell_A2', 'cell_A3'])
  .setAction('sum')
  .setInput('=SUM(A1:A3)');

const sai = builder.build();
const xmlString = builder.toXMLString();
```

### Error Handling

```typescript
import { 
  DataShopLoggerError,
  ConfigurationError,
  NetworkError 
} from '@learnlab/datashop-logger';

try {
  logger.logInterfaceAttempt('button', 'click', 'submit');
} catch (error) {
  if (error instanceof ConfigurationError) {
    console.error('Configuration issue:', error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network issue:', error.message);
  }
}
```

## Examples

### Basic Math Tutor

```typescript
import { DataShopLogger } from '@learnlab/datashop-logger';

const logger = new DataShopLogger({
  configuration: {
    log_service_url: 'https://pslc-qa.andrew.cmu.edu/log/server',
    dataset_name: 'BasicMathTutor',
    problem_name: 'Addition_TwoDigits',
    class_name: 'Grade3_Math',
    school_name: 'Elementary School',
    instructor_name: 'Ms. Johnson'
  }
});

// Start the session
logger.start();

// Student enters answer
const attemptId = logger.logInterfaceAttempt(
  'answer_field',
  'setValue',
  '15',
  { problem: '7 + 8', attemptNumber: 1 }
);

// Check answer and provide feedback
const correctAnswer = 7 + 8;
const studentAnswer = 15;

if (studentAnswer === correctAnswer) {
  logger.logResponse(
    attemptId,
    'answer_field',
    'setValue',
    '15',
    'RESULT',
    'CORRECT',
    'Perfect! 7 + 8 equals 15.'
  );
} else {
  logger.logResponse(
    attemptId,
    'answer_field',
    'setValue',
    '15',
    'RESULT',
    'INCORRECT',
    'Not quite. Try counting on your fingers.'
  );
}
```

### Complex Problem with Multiple Steps

```typescript
// Student working on multi-step problem
const steps = [
  { selection: 'step1_input', action: 'setValue', input: '5', expected: 5 },
  { selection: 'step2_input', action: 'setValue', input: '10', expected: 10 },
  { selection: 'final_answer', action: 'setValue', input: '50', expected: 50 }
];

for (const [index, step] of steps.entries()) {
  const txId = logger.logInterfaceAttempt(
    step.selection,
    step.action,
    step.input,
    { 
      stepNumber: index + 1,
      totalSteps: steps.length 
    }
  );
  
  // Evaluate each step
  const isCorrect = parseInt(step.input) === step.expected;
  logger.logResponse(
    txId,
    step.selection,
    step.action,
    step.input,
    'RESULT',
    isCorrect ? 'CORRECT' : 'INCORRECT',
    isCorrect ? 
      `Good job on step ${index + 1}!` : 
      `Check your work on step ${index + 1}.`
  );
}
```

### Advanced Example with Skills and Hierarchical Datasets

```typescript
import { DataShopLogger, Skill } from '@learnlab/datashop-logger';

const logger = new DataShopLogger({
  configuration: {
    log_service_url: 'https://pslc-qa.andrew.cmu.edu/log/server',
    dataset_name: 'AdvancedMathTutor',
    class_name: 'Algebra II',
    school_name: 'High School',
    instructor_name: 'Dr. Johnson'
  }
});

// Set up hierarchical dataset levels
logger.setDatasetLevelName(1, 'Mathematics');
logger.setDatasetLevelType(1, 'Subject');
logger.setDatasetLevelName(2, 'Algebra');
logger.setDatasetLevelType(2, 'Course');
logger.setDatasetLevelName(3, 'Quadratic Equations');
logger.setDatasetLevelType(3, 'Unit');
logger.setProblemName('Solving_Quadratics_01');

// Start session
logger.start();

// Student attempts to solve: x² + 5x + 6 = 0
const attemptId = logger.logInterfaceAttempt(
  'equation_solver',
  'factorize',
  '(x+2)(x+3)',
  { 
    equation: 'x² + 5x + 6 = 0',
    method: 'factoring'
  }
);

// Define knowledge components being assessed
const skills: Skill[] = [
  { 
    name: 'factoring-quadratics',
    category: 'algebra',
    opportunities: 5,
    predicted_error_rate: 0.15
  },
  {
    name: 'finding-factors',
    category: 'arithmetic',
    opportunities: 12,
    predicted_error_rate: 0.08
  }
];

// Log correct response with skills
logger.logResponse(
  attemptId,
  'equation_solver',
  'factorize',
  '(x+2)(x+3)',
  'RESULT',
  {
    evaluation: 'CORRECT',
    classification: 'correct-factorization'
  },
  'Excellent! You correctly factored the quadratic equation.',
  {
    timeSpent: 45000,
    hintsUsed: 0,
    attemptNumber: 1
  },
  skills
);
```

## Environment Support

- **Node.js**: 14.0.0 or higher
- **Browsers**: All modern browsers with ES2020 support
  - Chrome 80+
  - Firefox 75+
  - Safari 13.1+
  - Edge 80+

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build the library
npm run build

# Run linting
npm run lint

# Type checking
npm run typecheck
```

## New Object-Based API

Version 1.0+ introduces a cleaner object-based API that makes code more readable and maintainable:

### Benefits
- **Named Parameters**: No more memorizing parameter order
- **Better IDE Support**: Autocomplete shows available parameters
- **Self-Documenting**: Code clearly shows what each value represents
- **Future-Proof**: Easy to add new optional parameters without breaking changes

### Comparison
```typescript
// Old positional API (still supported)
logger.logResponse(txId, 'button', 'click', 'submit', 'RESULT', 'CORRECT', 'Good!', customFields, skills);

// New object-based API (recommended)
logger.logResponse({
  transactionId: txId,
  selection: 'button',
  action: 'click',
  input: 'submit',
  semanticName: 'RESULT',
  evaluation: 'CORRECT',
  advice: 'Good!',
  customFields: customFields,
  skills: skills
});
```

## Session Persistence

For single-page applications (SPAs) or when handling page refreshes, you can persist and resume sessions to maintain logging continuity:

### Basic Session Persistence

```typescript
// Save session data before page unload or route change
const sessionData = {
  sessionId: logger.getSessionId(),
  userGuid: logger.getUserGuid(),
  contextMessageId: logger.getContextMessageId()
};
localStorage.setItem('datashop_session', JSON.stringify(sessionData));

// On page load or route change, check for existing session
const savedSession = localStorage.getItem('datashop_session');
if (savedSession) {
  const { sessionId } = JSON.parse(savedSession);
  logger.resume(sessionId); // Resumes without sending duplicate log_session_start
} else {
  const sessionId = logger.start(); // Start new session
  // Save the new session data...
}
```

### React Hook Example

```typescript
import { useEffect, useRef } from 'react';
import { DataShopLogger } from '@learnlab/datashop-logger';

export function useDataShopLogger(config: LogConfiguration) {
  const loggerRef = useRef<DataShopLogger | null>(null);
  
  useEffect(() => {
    if (!loggerRef.current) {
      loggerRef.current = new DataShopLogger({ configuration: config });
      
      // Check for existing session
      const savedSession = localStorage.getItem('datashop_session');
      if (savedSession) {
        const { sessionId } = JSON.parse(savedSession);
        loggerRef.current.resume(sessionId);
      } else {
        const sessionId = loggerRef.current.start();
        localStorage.setItem('datashop_session', JSON.stringify({
          sessionId,
          userGuid: loggerRef.current.getUserGuid(),
          contextMessageId: loggerRef.current.getContextMessageId()
        }));
      }
    }
  }, []);
  
  return loggerRef.current;
}
```

### Key Methods for Session Management

- `start()`: Starts a new session and sends log_session_start message
- `resume(sessionId)`: Resumes an existing session without sending log_session_start
- `getSessionId()`: Returns the current session ID
- `getUserGuid()`: Returns the current user GUID
- `getContextMessageId()`: Returns the current context message ID

## Migration from JavaScript Version

If you're migrating from the JavaScript DataShopLogger:

1. **Import statements**: Change from CommonJS to ES modules
   ```javascript
   // Old
   const CTATLoggingLibrary = require('datashoplogger');
   
   // New
   import { DataShopLogger } from '@learnlab/datashop-logger';
   ```

2. **Constructor**: Update initialization
   ```javascript
   // Old
   const logger = new CTATLoggingLibrary(configuration);
   
   // New
   const logger = new DataShopLogger({ configuration });
   ```

3. **Method names**: Most methods remain the same, but with TypeScript you get:
   - Type checking for all parameters
   - IntelliSense/autocomplete in your IDE
   - Compile-time error detection

4. **New Features**: Take advantage of:
   - Object-based API for cleaner code
   - Built-in TypeScript types
   - Knowledge Component (Skills) support
   - Multiple dataset levels

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.

## Support

For issues, questions, or contributions:
- GitHub Issues: [https://github.com/CMU/datashop-logger-ts/issues](https://github.com/CMU/datashop-logger-ts/issues)
- DataShop Documentation: [https://pslcdatashop.web.cmu.edu](https://pslcdatashop.web.cmu.edu)

## Acknowledgments

This TypeScript SDK is based on the original JavaScript DataShopLogger developed by Carnegie Mellon University for the DataShop educational data repository.