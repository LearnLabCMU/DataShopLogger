import React, { useState } from 'react';
import './App.css';
import { DataShopLoggerProvider, useDataShopLogger } from '@learnlab/datashop-logger-react';

console.log('App.js loaded');

// Multiple Choice Question Component
function MultipleChoiceQuestion({ question }) {
  const { logAction, logResponse } = useDataShopLogger();
  const [selected, setSelected] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (!selected) return;

    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);

    const transactionId = logAction(
      `question-${question.id}`,
      'select-answer',
      selected,
      {
        attempt_number: newAttemptCount.toString()
      }
    );

    const answerIsCorrect = selected === question.correctAnswer;
    setIsCorrect(answerIsCorrect);
    
    const feedbackText = answerIsCorrect 
      ? 'Correct! Well done!' 
      : newAttemptCount < 3
        ? 'Not quite. Try again!'
        : `Incorrect. The correct answer is ${question.correctAnswer}`;

    setFeedback(feedbackText);

    if (transactionId) {
      logResponse({
        transactionId,
        selection: `question-${question.id}`,
        action: 'select-answer',
        input: selected,
        outcome: answerIsCorrect ? 'CORRECT' : 'INCORRECT',
        semanticName: 'RESULT',
        feedback: feedbackText,
        skills: question.skills,
        customFields: {
          question_type: 'multiple_choice',
          question_id: question.id,
          attempt_number: newAttemptCount.toString()
        }
      });
    }

    // Clear selection for next attempt if incorrect and attempts remaining
    if (!answerIsCorrect && newAttemptCount < 3) {
      setSelected(null);
      setTimeout(() => setFeedback(''), 2000); // Clear feedback after 2 seconds
    }
  };

  return (
    <div className="question-container">
      <h3>{question.text}</h3>
      <div className="options">
        {question.options.map(option => (
          <label key={option} className={`option ${feedback && option === question.correctAnswer ? 'correct' : ''}`}>
            <input
              type="radio"
              value={option}
              checked={selected === option}
              onChange={(e) => setSelected(e.target.value)}
              disabled={isCorrect || attemptCount >= 3}
            />
            {option}
          </label>
        ))}
      </div>
      <button onClick={handleSubmit} disabled={!selected || (isCorrect || attemptCount >= 3)}>
        Submit {attemptCount > 0 ? `(Attempt ${attemptCount + 1})` : ''}
      </button>
      {feedback && <div className={`feedback ${feedback.includes('Correct') ? 'correct' : 'incorrect'}`}>{feedback}</div>}
    </div>
  );
}

// Open-Ended Question Component
function OpenEndedQuestion({ question }) {
  const { logAction, logResponse } = useDataShopLogger();
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (!answer.trim()) return;

    const transactionId = logAction(
      `question-${question.id}`,
      'submit-text',
      answer
    );

    const feedbackText = 'Thank you for your response! Your answer has been recorded.';
    setFeedback(feedbackText);
    setSubmitted(true);

    if (transactionId) {
      logResponse({
        transactionId,
        selection: `question-${question.id}`,
        action: 'submit-text',
        input: answer,
        outcome: 'SUBMITTED',
        semanticName: 'RESULT',
        feedback: feedbackText,
        customFields: {
          response_length: answer.length.toString(),
          question_type: 'open_ended',
          question_id: question.id
        }
      });
    }
  };

  return (
    <div className="question-container">
      <h3>{question.text}</h3>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={4}
        cols={50}
        disabled={submitted}
        placeholder="Type your answer here..."
      />
      <br />
      <button onClick={handleSubmit} disabled={!answer.trim() || submitted}>
        Submit
      </button>
      {feedback && <div className="feedback hint">{feedback}</div>}
    </div>
  );
}

// Session Info Component
function SessionInfo() {
  const { sessionId, clearSession, isInitialized } = useDataShopLogger();

  return (
    <div className="session-info">
      <h3>Session Information</h3>
      <p>Status: {isInitialized ? 'Initialized' : 'Not initialized'}</p>
      <p>Session ID: {sessionId || 'None'}</p>
      <button onClick={clearSession}>Clear Session</button>
    </div>
  );
}

// Main Quiz Component
function Quiz() {
  const questions = [
    {
      id: 'mcq-1',
      type: 'multiple_choice',
      text: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 'Paris',
      skills: [{
        category: 'geography',
        name: 'european-capitals',
        opportunity: 1
      }]
    },
    {
      id: 'mcq-2',
      type: 'multiple_choice',
      text: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: '4',
      skills: [{
        category: 'math',
        name: 'basic-addition',
        opportunity: 1
      }]
    },
    {
      id: 'open-1',
      type: 'open_ended',
      text: 'Describe your favorite learning experience and what made it memorable.'
    },
    {
      id: 'mcq-3',
      type: 'multiple_choice',
      text: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 'Mars',
      skills: [{
        category: 'science',
        name: 'solar-system',
        opportunity: 1
      }]
    },
    {
      id: 'open-2',
      type: 'open_ended',
      text: 'What strategies do you use to remember new information?'
    }
  ];

  return (
    <div className="quiz">
      <h1>DataShop Logger React SDK Example</h1>
      <SessionInfo />
      
      <h2>Quiz Questions</h2>
      {questions.map(question => (
        question.type === 'multiple_choice' 
          ? <MultipleChoiceQuestion key={question.id} question={question} />
          : <OpenEndedQuestion key={question.id} question={question} />
      ))}
    </div>
  );
}

// App Component with Provider
function App() {
  console.log('App component rendering');
  
  // Check if we should use proxy (development mode)
  const useProxy = window.location.hostname === 'localhost';
  
  const config = {
    log_service_url: useProxy 
      ? '/datashop-proxy'  // Use proxy in development
      : 'https://pslc-qa.andrew.cmu.edu/log/server',  // Direct in production
    dataset_name: 'eason-test-0720',
    dataset_level_name1: 'SDK_Type',
    dataset_level_type1: 'sdk_type',
    dataset_level_name2: 'React_SDK',
    dataset_level_type2: 'section',
    problem_name: 'React_SDK_Mixed_Quiz',
    // user_guid will be auto-generated and persisted in localStorage
    school_name: 'CMU Test School',
    instructor_name: 'React SDK Test'
  };
  
  console.log('Using proxy:', useProxy);
  console.log('Log service URL:', config.log_service_url);

  return (
    <DataShopLoggerProvider 
      config={config}
      autoInitialize={true}
      persistSession={true}
    >
      <Quiz />
    </DataShopLoggerProvider>
  );
}

export default App;