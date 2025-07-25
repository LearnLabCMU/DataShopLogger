import React from 'react';

// Try different import methods
let DataShopLoggerProvider, useDataShopLogger;

try {
  // Method 1: Direct import
  const sdk = require('@learnlab/datashop-logger-react');
  DataShopLoggerProvider = sdk.DataShopLoggerProvider;
  useDataShopLogger = sdk.useDataShopLogger;
  console.log('SDK loaded successfully:', { DataShopLoggerProvider, useDataShopLogger });
} catch (e) {
  console.error('Failed to load SDK:', e);
}

function TestContent() {
  try {
    const logger = useDataShopLogger();
    return (
      <div>
        <h2>Logger loaded!</h2>
        <p>Session ID: {logger.sessionId || 'None'}</p>
        <p>Initialized: {logger.isInitialized ? 'Yes' : 'No'}</p>
      </div>
    );
  } catch (e) {
    return (
      <div>
        <h2>Hook Error:</h2>
        <pre>{e.message}</pre>
      </div>
    );
  }
}

function TestSDK() {
  if (!DataShopLoggerProvider) {
    return <div>SDK not loaded!</div>;
  }

  const config = {
    log_service_url: 'https://learnlab.web.cmu.edu/log/server',
    dataset_name: 'Test SDK',
    problem_name: 'Test',
    user_guid: 'test-user',
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Testing DataShop Logger React SDK</h1>
      <DataShopLoggerProvider config={config} autoInitialize={true}>
        <TestContent />
      </DataShopLoggerProvider>
    </div>
  );
}

export default TestSDK;