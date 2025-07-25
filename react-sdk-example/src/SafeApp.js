import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h1>Something went wrong!</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

function SafeApp() {
  const [showSDK, setShowSDK] = React.useState(false);
  
  return (
    <ErrorBoundary>
      <div style={{ padding: '20px' }}>
        <h1>Safe App Test</h1>
        <p>This app tests the SDK import step by step.</p>
        
        <button onClick={() => setShowSDK(!showSDK)}>
          {showSDK ? 'Hide' : 'Show'} SDK Test
        </button>
        
        {showSDK && (
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0' }}>
            <h2>Testing SDK Import...</h2>
            <SDKTest />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

function SDKTest() {
  let DataShopLoggerProvider, useDataShopLogger;
  let error = null;
  
  try {
    const sdk = require('@learnlab/datashop-logger-react');
    DataShopLoggerProvider = sdk.DataShopLoggerProvider;
    useDataShopLogger = sdk.useDataShopLogger;
  } catch (e) {
    error = e;
  }
  
  if (error) {
    return <div>Import Error: {error.message}</div>;
  }
  
  if (!DataShopLoggerProvider || !useDataShopLogger) {
    return <div>SDK components not found!</div>;
  }
  
  return (
    <div>
      <p>✅ SDK imported successfully!</p>
      <p>DataShopLoggerProvider: {typeof DataShopLoggerProvider}</p>
      <p>useDataShopLogger: {typeof useDataShopLogger}</p>
      
      <h3>Testing Provider...</h3>
      <TestProvider 
        DataShopLoggerProvider={DataShopLoggerProvider} 
        useDataShopLogger={useDataShopLogger} 
      />
    </div>
  );
}

function TestProvider({ DataShopLoggerProvider, useDataShopLogger }) {
  const config = {
    log_service_url: 'https://learnlab.web.cmu.edu/log/server',
    dataset_name: 'Test',
    problem_name: 'Test',
    user_guid: 'test-user'
  };
  
  return (
    <DataShopLoggerProvider config={config} autoInitialize={true}>
      <TestHook useDataShopLogger={useDataShopLogger} />
    </DataShopLoggerProvider>
  );
}

function TestHook({ useDataShopLogger }) {
  try {
    const logger = useDataShopLogger();
    return (
      <div>
        <p>✅ Hook works!</p>
        <p>Session ID: {logger.sessionId || 'None'}</p>
        <p>Initialized: {logger.isInitialized ? 'Yes' : 'No'}</p>
      </div>
    );
  } catch (e) {
    return <div>Hook Error: {e.message}</div>;
  }
}

export default SafeApp;