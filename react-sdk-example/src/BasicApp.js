import React from 'react';

function BasicApp() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Basic React App Test</h1>
      <p>This is a simple test without the DataShop SDK.</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

export default BasicApp;