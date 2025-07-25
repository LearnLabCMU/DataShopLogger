# @learnlab/datashop-logger-react

React SDK for DataShop Logger with hooks and context support. This package provides a React-friendly wrapper around the DataShop Logger TypeScript SDK.

## Installation

```bash
npm install @learnlab/datashop-logger-react
# or
yarn add @learnlab/datashop-logger-react
```

## Quick Start

### 1. Wrap your app with the provider

```tsx
import { DataShopLoggerProvider } from '@learnlab/datashop-logger-react';

const config = {
  log_service_url: 'https://learnlab.web.cmu.edu/log/server',
  dataset_name: 'MyDataset',
  dataset_level_names: ['Unit', 'Section'],
  dataset_level_names_0: 'Fractions',
  dataset_level_names_1: 'Addition',
  problem_name: 'Problem 1',
  user_guid: 'student123',
  school_name: 'Example School',
  instructor_name: 'Dr. Smith'
};

function App() {
  return (
    <DataShopLoggerProvider 
      config={config}
      autoInitialize={true}
      persistSession={true}
    >
      <YourApp />
    </DataShopLoggerProvider>
  );
}
```

### 2. Use the hook in your components

```tsx
import { useDataShopLogger } from '@learnlab/datashop-logger-react';

function QuizComponent() {
  const { logAction, logResponse, sessionId, isInitialized } = useDataShopLogger();

  const handleAnswer = (answer: string) => {
    // Log the student action
    const transactionId = logAction('question-1', 'submit', answer);

    // Evaluate the answer and log the response
    const isCorrect = answer === 'correct_answer';
    
    if (transactionId) {
      logResponse({
        transactionId,
        selection: 'question-1',
        action: 'submit',
        input: answer,
        outcome: isCorrect ? 'CORRECT' : 'INCORRECT',
        feedback: isCorrect ? 'Great job!' : 'Try again!',
        skills: [{
          category: 'math',
          name: 'fraction-addition',
          opportunity: 1
        }]
      });
    }
  };

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>Session ID: {sessionId}</p>
      <button onClick={() => handleAnswer('user_answer')}>Submit Answer</button>
    </div>
  );
}
```

## API Reference

### DataShopLoggerProvider

Provider component that manages the DataShop logger instance and session persistence.

#### Props

- `config?: LogConfiguration` - Configuration object for the DataShop logger
- `autoInitialize?: boolean` - Whether to automatically initialize on mount (default: false)
- `persistSession?: boolean` - Whether to persist session to localStorage (default: true)
- `children: React.ReactNode` - Child components

### useDataShopLogger

Hook that provides access to the DataShop logger functionality.

#### Returns

```typescript
{
  logger: DataShopLogger | null;
  sessionId: string | null;
  isInitialized: boolean;
  initialize: (config: LogConfiguration) => string;
  logAction: (selection: string, action: string, input: string, customFields?: Record<string, string>) => string | null;
  logResponse: (params: ResponseParams) => void;
  clearSession: () => void;
  resumeSession: (sessionId: string) => void;
  getLastSAI: () => SAI | null;
}
```

## Session Persistence

The React SDK automatically handles session persistence using localStorage. When `persistSession` is enabled:

- Sessions are saved to localStorage on initialization
- Sessions are automatically resumed on page reload
- Session data can be cleared using the `clearSession()` method

## Example: Multiple Choice Question

```tsx
function MultipleChoiceQuestion({ question, options, correctAnswer }) {
  const { logAction, logResponse } = useDataShopLogger();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!selected) return;

    const transactionId = logAction(
      `question-${question.id}`,
      'select-answer',
      selected
    );

    if (transactionId) {
      logResponse({
        transactionId,
        selection: `question-${question.id}`,
        action: 'select-answer',
        input: selected,
        outcome: selected === correctAnswer ? 'CORRECT' : 'INCORRECT',
        feedback: selected === correctAnswer 
          ? 'Correct!' 
          : `Incorrect. The correct answer is ${correctAnswer}`,
        skills: question.skills
      });
    }
  };

  return (
    <div>
      <h3>{question.text}</h3>
      {options.map(option => (
        <label key={option}>
          <input
            type="radio"
            value={option}
            checked={selected === option}
            onChange={(e) => setSelected(e.target.value)}
          />
          {option}
        </label>
      ))}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

## Example: Open-Ended Question

```tsx
function OpenEndedQuestion({ question }) {
  const { logAction, logResponse } = useDataShopLogger();
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    const transactionId = logAction(
      `question-${question.id}`,
      'submit-text',
      answer
    );

    // For open-ended questions, you might want to log as hint
    // and provide feedback without marking correct/incorrect
    if (transactionId) {
      logResponse({
        transactionId,
        selection: `question-${question.id}`,
        action: 'submit-text',
        input: answer,
        outcome: 'HINT',
        feedback: 'Thank you for your response!',
        customFields: {
          response_length: answer.length.toString(),
          question_type: 'open_ended'
        }
      });
    }
  };

  return (
    <div>
      <h3>{question.text}</h3>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={4}
        cols={50}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

## TypeScript Support

This package is written in TypeScript and includes full type definitions. The main types are re-exported from the base SDK:

```typescript
import type { LogConfiguration, SAI, Skill } from '@learnlab/datashop-logger-react';
```

## License

MIT © Carnegie Mellon University