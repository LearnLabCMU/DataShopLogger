import React, { useState } from 'react';
import { DataShopLoggerProvider, useDataShopLogger } from '@learnlab/datashop-logger-react';
import './App.css';

// Session Info Component
function SessionInfo() {
  const { sessionId, isInitialized, clearSession } = useDataShopLogger();
  
  return (
    <div style={{ 
      backgroundColor: '#f0f0f0', 
      padding: '15px', 
      marginBottom: '20px',
      borderRadius: '5px' 
    }}>
      <h3>Session Information</h3>
      <p>Status: {isInitialized ? '✅ Initialized' : '❌ Not initialized'}</p>
      <p>Session ID: <code>{sessionId || 'N/A'}</code></p>
      <button onClick={clearSession}>Clear Session</button>
    </div>
  );
}

// Multiple Choice Question Component
function MultipleChoiceQuestion({ question }) {
  const { logAction, logResponse } = useDataShopLogger();
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (!selected) return;

    // Log the student action
    const transactionId = logAction(
      `question-${question.id}`,
      'select-answer',
      selected
    );

    const isCorrect = selected === question.correctAnswer;
    const feedbackText = isCorrect 
      ? 'Correct! Well done!' 
      : `Incorrect. The correct answer is ${question.correctAnswer}`;

    setFeedback(feedbackText);
    setSubmitted(true);

    // Log the tutor response
    if (transactionId) {
      logResponse({
        transactionId,
        selection: `question-${question.id}`,
        action: 'select-answer',
        input: selected,
        outcome: isCorrect ? 'CORRECT' : 'INCORRECT',
        feedback: feedbackText,
        skills: question.skills
      });
    }
  };

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      padding: '20px', 
      marginBottom: '20px',
      borderRadius: '5px'
    }}>
      <h3>{question.text}</h3>
      <div>
        {question.options.map(option => (
          <label key={option} style={{ display: 'block', marginBottom: '10px' }}>
            <input
              type="radio"
              value={option}
              checked={selected === option}
              onChange={(e) => setSelected(e.target.value)}
              disabled={submitted}
            />
            <span style={{ marginLeft: '10px' }}>{option}</span>
          </label>
        ))}
      </div>
      <button 
        onClick={handleSubmit} 
        disabled={!selected || submitted}
        style={{ marginTop: '10px' }}
      >
        Submit
      </button>
      {feedback && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px',
          backgroundColor: feedback.includes('Correct') ? '#d4edda' : '#f8d7da',
          borderRadius: '5px'
        }}>
          {feedback}
        </div>
      )}
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
    }
  ];

  return (
    <div>
      <h1>DataShop Logger React SDK Example</h1>
      <SessionInfo />
      
      <h2>Quiz Questions</h2>
      {questions.map(question => (
        <MultipleChoiceQuestion key={question.id} question={question} />
      ))}
    </div>
  );
}

// App Component with Provider
function WorkingQuizApp() {
  const config = {
    log_service_url: 'https://learnlab.web.cmu.edu/log/server',
    dataset_name: 'React SDK Example',
    problem_name: 'Simple Quiz',
    user_guid: 'react-example-user-' + Date.now()
  };

  return (
    <DataShopLoggerProvider 
      config={config}
      autoInitialize={true}
      persistSession={true}
    >
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <Quiz />
      </div>
    </DataShopLoggerProvider>
  );
}

export default WorkingQuizApp;