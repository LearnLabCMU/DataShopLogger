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
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h1>React Error Caught!</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

function TestSDKImport() {
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
    return (
      <div>
        <h2>Import Error:</h2>
        <pre>{error.message}</pre>
      </div>
    );
  }
  
  if (!DataShopLoggerProvider) {
    return <div>SDK not loaded properly</div>;
  }
  
  // Simple component that uses the hook
  function Inner() {
    try {
      const logger = useDataShopLogger();
      return <div>Logger loaded! Session: {logger.sessionId || 'none'}</div>;
    } catch (e) {
      return <div>Hook error: {e.message}</div>;
    }
  }
  
  const config = {
    log_service_url: 'https://learnlab.web.cmu.edu/log/server',
    dataset_name: 'Test',
    problem_name: 'Test',
    user_guid: 'test'
  };
  
  return (
    <DataShopLoggerProvider config={config} autoInitialize={true}>
      <Inner />
    </DataShopLoggerProvider>
  );
}

function ErrorBoundaryApp() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Error Boundary Test</h1>
      <ErrorBoundary>
        <TestSDKImport />
      </ErrorBoundary>
    </div>
  );
}

export default ErrorBoundaryApp;