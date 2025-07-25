import React from 'react';
import './App.css';

console.log('SimpleApp loaded');

// Try to import our SDK
let DataShopLoggerProvider = null;
let useDataShopLogger = null;
let importError = null;

try {
  const sdk = require('@learnlab/datashop-logger-react');
  console.log('SDK imported:', sdk);
  DataShopLoggerProvider = sdk.DataShopLoggerProvider;
  useDataShopLogger = sdk.useDataShopLogger;
} catch (error) {
  importError = error;
  console.error('Failed to import SDK:', error);
}

function SimpleApp() {
  console.log('SimpleApp rendering');
  
  if (importError) {
    return (
      <div>
        <h1>Import Error</h1>
        <pre>{importError.message}</pre>
        <pre>{importError.stack}</pre>
      </div>
    );
  }
  
  if (!DataShopLoggerProvider) {
    return (
      <div>
        <h1>SDK Not Loaded</h1>
        <p>DataShopLoggerProvider is not available</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1>Simple App Working!</h1>
      <p>SDK loaded successfully</p>
      <p>Provider: {DataShopLoggerProvider ? 'Available' : 'Not available'}</p>
      <p>Hook: {useDataShopLogger ? 'Available' : 'Not available'}</p>
    </div>
  );
}

export default SimpleApp;