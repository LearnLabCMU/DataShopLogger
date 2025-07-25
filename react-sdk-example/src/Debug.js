import React, { useState, useEffect } from 'react';
import './App.css';

// Import the SDK
import { DataShopLoggerProvider, useDataShopLogger } from '@learnlab/datashop-logger-react';

// Debug Component to test logging
function DebugLogger() {
  const { isInitialized, sessionId, getUserGuid, logAction, logResponse } = useDataShopLogger();
  const [logs, setLogs] = useState([]);
  const [testUrl, setTestUrl] = useState('https://pslc-qa.andrew.cmu.edu/log/server');

  // Add a log entry
  const addLog = (message, data) => {
    setLogs(prev => [...prev, { time: new Date().toISOString(), message, data }]);
  };

  // Test basic connectivity
  const testConnection = async () => {
    addLog('Testing connection to ' + testUrl, null);
    
    try {
      // Test with fetch first
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: '<test>Connection test</test>',
        mode: 'no-cors' // Try no-cors mode
      });
      
      addLog('Fetch completed (no-cors mode)', { status: 'completed' });
    } catch (error) {
      addLog('Fetch error', { error: error.message });
    }

    // Test with sendBeacon
    try {
      if (navigator.sendBeacon) {
        const success = navigator.sendBeacon(testUrl, '<test>Beacon test</test>');
        addLog('sendBeacon result', { success });
      } else {
        addLog('sendBeacon not available', null);
      }
    } catch (error) {
      addLog('sendBeacon error', { error: error.message });
    }
  };

  // Test actual logging
  const testLogging = () => {
    addLog('Starting logging test', { isInitialized, sessionId, userGuid: getUserGuid() });
    
    try {
      const transactionId = logAction('test-element', 'test-action', 'test-input', {
        test: 'true'
      });
      
      addLog('logAction completed', { transactionId });

      if (transactionId) {
        logResponse({
          transactionId,
          selection: 'test-element',
          action: 'test-action',
          input: 'test-input',
          outcome: 'CORRECT',
          feedback: 'Test successful'
        });
        
        addLog('logResponse completed', null);
      }
    } catch (error) {
      addLog('Logging error', { error: error.message, stack: error.stack });
    }
  };

  // Monitor network requests
  useEffect(() => {
    // Override fetch to log requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      addLog('Fetch request', { url: args[0], options: args[1] });
      return originalFetch.apply(this, args).catch(err => {
        addLog('Fetch failed', { error: err.message });
        throw err;
      });
    };

    // Override sendBeacon to log requests
    if (navigator.sendBeacon) {
      const originalSendBeacon = navigator.sendBeacon;
      navigator.sendBeacon = function(...args) {
        addLog('sendBeacon request', { url: args[0], data: args[1]?.substring(0, 100) + '...' });
        try {
          const result = originalSendBeacon.apply(this, args);
          addLog('sendBeacon result', { success: result });
          return result;
        } catch (err) {
          addLog('sendBeacon error', { error: err.message });
          return false;
        }
      };
    }

    return () => {
      window.fetch = originalFetch;
      if (navigator.sendBeacon) {
        navigator.sendBeacon = originalSendBeacon;
      }
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>DataShop Logger Debug Tool</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Status</h2>
        <p>Initialized: {isInitialized ? 'Yes' : 'No'}</p>
        <p>Session ID: {sessionId || 'None'}</p>
        <p>User GUID: {getUserGuid() || 'None'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Test URL</h2>
        <input 
          type="text" 
          value={testUrl} 
          onChange={(e) => setTestUrl(e.target.value)}
          style={{ width: '400px', marginRight: '10px' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Actions</h2>
        <button onClick={testConnection} style={{ marginRight: '10px' }}>Test Connection</button>
        <button onClick={testLogging} style={{ marginRight: '10px' }}>Test Logging</button>
        <button onClick={() => setLogs([])}>Clear Logs</button>
      </div>

      <div>
        <h2>Logs</h2>
        <div style={{ 
          border: '1px solid #ccc', 
          padding: '10px', 
          height: '400px', 
          overflow: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
              <div style={{ color: '#666' }}>{log.time}</div>
              <div style={{ fontWeight: 'bold' }}>{log.message}</div>
              {log.data && (
                <pre style={{ margin: '5px 0', color: '#333' }}>
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// App Component
function DebugApp() {
  const [useProxy, setUseProxy] = useState(false);
  
  const config = {
    log_service_url: useProxy 
      ? '/api/datashop-proxy' 
      : 'https://pslc-qa.andrew.cmu.edu/log/server',
    dataset_name: 'eason-test-0720',
    dataset_level_name1: 'SDK_Type',
    dataset_level_type1: 'sdk_type',
    dataset_level_name2: 'React_SDK',
    dataset_level_type2: 'section',
    problem_name: 'React_SDK_Debug',
    school_name: 'CMU Test School',
    instructor_name: 'React SDK Debug'
  };

  return (
    <div>
      <div style={{ padding: '10px', background: '#f0f0f0' }}>
        <label>
          <input 
            type="checkbox" 
            checked={useProxy} 
            onChange={(e) => setUseProxy(e.target.checked)}
          />
          Use Proxy (for CORS bypass)
        </label>
      </div>
      
      <DataShopLoggerProvider 
        config={config}
        autoInitialize={true}
        persistSession={true}
      >
        <DebugLogger />
      </DataShopLoggerProvider>
    </div>
  );
}

export default DebugApp;