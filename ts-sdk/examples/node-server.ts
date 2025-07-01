/**
 * Node.js server example for DataShop Logger
 * This example shows how to use the logger in a server environment
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { DataShopLogger } from '../src';
import type { LogConfiguration } from '../src';

// Store active sessions
const sessions = new Map<string, DataShopLogger>();

// Configuration for the logger
const baseConfig: LogConfiguration = {
  log_service_url: 'https://pslc-qa.andrew.cmu.edu/log/server',
  dataset_name: 'NodeServerExample',
  dataset_level_name1: 'API',
  dataset_level_type1: 'Module',
  class_name: 'Node.js Demo',
  school_name: 'Server University',
  instructor_name: 'Node Teacher'
};

// Helper to parse JSON body
const parseBody = (req: IncomingMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
};

// Create HTTP server
const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  
  try {
    // Route: Start new session
    if (req.method === 'POST' && url.pathname === '/session/start') {
      const body = await parseBody(req);
      const { userId, problemName, problemContext } = body;
      
      // Create new logger instance for this session
      const logger = new DataShopLogger({
        configuration: {
          ...baseConfig,
          user_guid: userId,
          problem_name: problemName || 'UnknownProblem',
          problem_context: problemContext || 'No context provided'
        }
      });
      
      // Start session
      const sessionId = logger.start();
      sessions.set(sessionId, logger);
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        sessionId,
        message: 'Session started successfully'
      }));
      return;
    }
    
    // Route: Log attempt
    if (req.method === 'POST' && url.pathname === '/log/attempt') {
      const body = await parseBody(req);
      const { sessionId, selection, action, input, customFields } = body;
      
      const logger = sessions.get(sessionId);
      if (!logger) {
        res.writeHead(404);
        res.end(JSON.stringify({
          success: false,
          error: 'Session not found'
        }));
        return;
      }
      
      const transactionId = logger.logInterfaceAttempt(
        selection,
        action,
        input,
        customFields
      );
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        transactionId,
        message: 'Attempt logged successfully'
      }));
      return;
    }
    
    // Route: Log response
    if (req.method === 'POST' && url.pathname === '/log/response') {
      const body = await parseBody(req);
      const {
        sessionId,
        transactionId,
        selection,
        action,
        input,
        evaluation,
        feedback,
        customFields
      } = body;
      
      const logger = sessions.get(sessionId);
      if (!logger) {
        res.writeHead(404);
        res.end(JSON.stringify({
          success: false,
          error: 'Session not found'
        }));
        return;
      }
      
      logger.logResponse(
        transactionId,
        selection,
        action,
        input,
        'RESULT',
        evaluation,
        feedback,
        customFields
      );
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'Response logged successfully'
      }));
      return;
    }
    
    // Route: Log hint request
    if (req.method === 'POST' && url.pathname === '/log/hint-request') {
      const body = await parseBody(req);
      const { sessionId, selection, action, input, customFields } = body;
      
      const logger = sessions.get(sessionId);
      if (!logger) {
        res.writeHead(404);
        res.end(JSON.stringify({
          success: false,
          error: 'Session not found'
        }));
        return;
      }
      
      const transactionId = logger.logInterfaceHintRequest(
        selection,
        action,
        input,
        customFields
      );
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        transactionId,
        message: 'Hint request logged successfully'
      }));
      return;
    }
    
    // Route: End session
    if (req.method === 'POST' && url.pathname === '/session/end') {
      const body = await parseBody(req);
      const { sessionId } = body;
      
      const logger = sessions.get(sessionId);
      if (!logger) {
        res.writeHead(404);
        res.end(JSON.stringify({
          success: false,
          error: 'Session not found'
        }));
        return;
      }
      
      logger.endSession();
      sessions.delete(sessionId);
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'Session ended successfully'
      }));
      return;
    }
    
    // Route: Health check
    if (req.method === 'GET' && url.pathname === '/health') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        status: 'healthy',
        activeSessions: sessions.size
      }));
      return;
    }
    
    // 404 for unknown routes
    res.writeHead(404);
    res.end(JSON.stringify({
      success: false,
      error: 'Route not found'
    }));
    
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }));
  }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`DataShop Logger server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Example client code (can be in a separate file)
const exampleClient = async () => {
  const baseUrl = `http://localhost:${PORT}`;
  
  // Start session
  const startRes = await fetch(`${baseUrl}/session/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'student123',
      problemName: 'Algebra_Problem_1',
      problemContext: 'Solving linear equations'
    })
  });
  
  const { sessionId } = await startRes.json();
  console.log('Started session:', sessionId);
  
  // Log an attempt
  const attemptRes = await fetch(`${baseUrl}/log/attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      selection: 'equation_input',
      action: 'solve',
      input: 'x = 5',
      customFields: {
        equation: '2x + 3 = 13',
        step: 1
      }
    })
  });
  
  const { transactionId } = await attemptRes.json();
  console.log('Logged attempt:', transactionId);
  
  // Log evaluation
  await fetch(`${baseUrl}/log/response`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      transactionId,
      selection: 'equation_input',
      action: 'solve',
      input: 'x = 5',
      evaluation: 'CORRECT',
      feedback: 'Excellent! You solved the equation correctly.'
    })
  });
  
  console.log('Logged response');
  
  // End session
  await fetch(`${baseUrl}/session/end`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId })
  });
  
  console.log('Session ended');
};

// Uncomment to run example client
// setTimeout(() => exampleClient().catch(console.error), 1000);