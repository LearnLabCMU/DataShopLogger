import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import App from './TestApp';
// import App from './SimpleApp';
// import App from './WorkingApp';
// import App from './FinalApp';
// import App from './TestSDK';
// import App from './BasicApp';
// import App from './DebugApp';
// import App from './MinimalApp';
// import App from './ErrorBoundaryApp';
// import App from './WorkingQuizApp';
// import App from './SafeApp';
import reportWebVitals from './reportWebVitals';

console.log('index.js loaded');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
