import React, { useState } from 'react';
import { DataShopLoggerProvider, useDataShopLogger } from '@learnlab/datashop-logger-react';

function LoggerTest() {
  const { sessionId, isInitialized, logAction, logResponse } = useDataShopLogger();
  const [answer, setAnswer] = useState('');
  
  const handleSubmit = () => {
    const transactionId = logAction('test-question', 'submit', answer);
    
    if (transactionId) {
      logResponse({
        transactionId,
        selection: 'test-question',
        action: 'submit',
        input: answer,
        outcome: answer === 'Paris' ? 'CORRECT' : 'INCORRECT',
        feedback: answer === 'Paris' ? 'Correct!' : 'Try again'
      });
    }
  };
  
  return (
    <div>
      <h2>Logger Status</h2>
      <p>Initialized: {isInitialized ? 'Yes' : 'No'}</p>
      <p>Session ID: {sessionId || 'None'}</p>
      
      <h2>Test Question</h2>
      <p>What is the capital of France?</p>
      <input 
        value={answer} 
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Enter your answer"
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

function MinimalApp() {
  const config = {
    log_service_url: 'https://learnlab.web.cmu.edu/log/server',
    dataset_name: 'React SDK Test',
    problem_name: 'Test Problem',
    user_guid: 'test-user-' + Date.now()
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Minimal DataShop React SDK Test</h1>
      <DataShopLoggerProvider config={config} autoInitialize={true}>
        <LoggerTest />
      </DataShopLoggerProvider>
    </div>
  );
}

export default MinimalApp;