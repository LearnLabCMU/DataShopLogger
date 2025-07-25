import React, { useState } from 'react';
import './App.css';

// Import the SDK
const sdk = require('@learnlab/datashop-logger-react');
const { DataShopLoggerProvider, useDataShopLogger } = sdk;

console.log('WorkingApp loaded', { DataShopLoggerProvider, useDataShopLogger });

// Session Info Component
function SessionInfo() {
  const { sessionId, clearSession, isInitialized } = useDataShopLogger();

  return (
    <div className="session-info">
      <h3>Session Information</h3>
      <p>Status: {isInitialized ? 'Initialized' : 'Not initialized'}</p>
      <p>Session ID: {sessionId || 'N/A'}</p>
      <button onClick={clearSession}>Clear Session</button>
    </div>
  );
}

// Simple Question Component
function SimpleQuestion() {
  const { logAction, logResponse } = useDataShopLogger();
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    console.log('Submitting answer:', answer);
    
    const transactionId = logAction('question-1', 'submit', answer);
    console.log('Transaction ID:', transactionId);
    
    if (transactionId) {
      logResponse({
        transactionId,
        selection: 'question-1',
        action: 'submit',
        input: answer,
        outcome: answer === 'Paris' ? 'CORRECT' : 'INCORRECT',
        feedback: answer === 'Paris' ? 'Correct!' : 'Incorrect',
      });
    }
    
    setSubmitted(true);
  };

  return (
    <div className="question-container">
      <h3>What is the capital of France?</h3>
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={submitted}
      />
      <button onClick={handleSubmit} disabled={!answer || submitted}>
        Submit
      </button>
      {submitted && <p>Answer submitted!</p>}
    </div>
  );
}

// Main App Component
function WorkingApp() {
  console.log('WorkingApp rendering');
  
  const config = {
    log_service_url: 'https://learnlab.web.cmu.edu/log/server',
    dataset_name: 'React SDK Test',
    problem_name: 'Test Problem',
    user_guid: 'test-user-' + Date.now(),
  };

  return (
    <DataShopLoggerProvider 
      config={config}
      autoInitialize={true}
      persistSession={true}
    >
      <div className="App">
        <h1>DataShop Logger React SDK Test</h1>
        <SessionInfo />
        <SimpleQuestion />
      </div>
    </DataShopLoggerProvider>
  );
}

export default WorkingApp;