import React from 'react';

// Debug imports
console.log('DebugApp: Starting imports...');

let sdk = null;
let importError = null;

try {
  sdk = require('@learnlab/datashop-logger-react');
  console.log('DebugApp: SDK imported successfully', sdk);
} catch (e) {
  importError = e;
  console.error('DebugApp: Failed to import SDK', e);
}

function DebugApp() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Debug DataShop React SDK</h1>
      
      <h2>Import Status:</h2>
      {importError ? (
        <div style={{ color: 'red' }}>
          <p>Import failed with error:</p>
          <pre>{importError.message}</pre>
          <pre>{importError.stack}</pre>
        </div>
      ) : (
        <div style={{ color: 'green' }}>
          <p>Import successful!</p>
        </div>
      )}
      
      <h2>SDK Contents:</h2>
      <pre>{JSON.stringify(sdk, null, 2)}</pre>
      
      <h2>Available exports:</h2>
      {sdk && (
        <ul>
          {Object.keys(sdk).map(key => (
            <li key={key}>{key}: {typeof sdk[key]}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DebugApp;