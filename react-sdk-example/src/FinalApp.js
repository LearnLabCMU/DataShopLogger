import React from 'react';
import './App.css';

console.log('FinalApp loading...');

// Import SDK components
const sdk = require('@learnlab/datashop-logger-react');
const { DataShopLoggerProvider, useDataShopLogger } = sdk;

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple Content Component
function Content() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>DataShop Logger React SDK Demo</h1>
      <p>This is a test of the React SDK</p>
      <InnerContent />
    </div>
  );
}

// Component that uses the hook
function InnerContent() {
  const { sessionId, isInitialized } = useDataShopLogger();
  
  return (
    <div>
      <p>Hook works!</p>
      <p>Initialized: {isInitialized ? 'Yes' : 'No'}</p>
      <p>Session ID: {sessionId || 'None'}</p>
    </div>
  );
}

// Main App
function FinalApp() {
  console.log('FinalApp rendering...');
  
  const config = {
    log_service_url: 'https://learnlab.web.cmu.edu/log/server',
    dataset_name: 'React SDK Demo',
    problem_name: 'Test',
    user_guid: 'demo-user-' + Date.now(),
  };

  return (
    <ErrorBoundary>
      <div>
        <h1>Outside Provider</h1>
        <DataShopLoggerProvider config={config} autoInitialize={true}>
          <Content />
        </DataShopLoggerProvider>
      </div>
    </ErrorBoundary>
  );
}

export default FinalApp;