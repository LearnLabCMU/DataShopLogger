/**
 * React integration example for DataShop Logger
 * This example shows how to use the logger in a React application
 */

import React, { useState, useEffect, useRef } from 'react';
import { DataShopLogger } from '../src';
import type { IDataShopLogger } from '../src';

// Create a context for the logger
const LoggerContext = React.createContext<IDataShopLogger | null>(null);

// Logger provider component
export const DataShopLoggerProvider: React.FC<{
  children: React.ReactNode;
  configuration: Parameters<typeof DataShopLogger>[0]['configuration'];
}> = ({ children, configuration }) => {
  const loggerRef = useRef<IDataShopLogger | null>(null);
  
  useEffect(() => {
    // Initialize logger
    const logger = new DataShopLogger({ configuration });
    loggerRef.current = logger;
    
    // Start session
    const sessionId = logger.start();
    console.log('DataShop session started:', sessionId);
    
    return () => {
      // End session on unmount
      logger.endSession();
    };
  }, []);
  
  return (
    <LoggerContext.Provider value={loggerRef.current}>
      {children}
    </LoggerContext.Provider>
  );
};

// Hook to use the logger
export const useDataShopLogger = () => {
  const logger = React.useContext(LoggerContext);
  if (!logger) {
    throw new Error('useDataShopLogger must be used within DataShopLoggerProvider');
  }
  return logger;
};

// Example math problem component
interface MathProblemProps {
  question: string;
  correctAnswer: number;
  problemId: string;
}

export const MathProblem: React.FC<MathProblemProps> = ({
  question,
  correctAnswer,
  problemId
}) => {
  const logger = useDataShopLogger();
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const attemptNumber = attempts + 1;
    setAttempts(attemptNumber);
    
    // Log the attempt
    const transactionId = logger.logInterfaceAttempt(
      `${problemId}_answer_input`,
      'submit',
      answer,
      {
        problemId,
        attemptNumber,
        timestamp: new Date().toISOString()
      }
    );
    
    // Check answer
    const userAnswer = parseFloat(answer);
    const correct = userAnswer === correctAnswer;
    setIsCorrect(correct);
    
    // Log the evaluation
    if (correct) {
      setFeedback('Correct! Well done!');
      logger.logResponse(
        transactionId,
        `${problemId}_answer_input`,
        'submit',
        answer,
        'RESULT',
        'CORRECT',
        'Great job! You got the right answer.'
      );
    } else {
      setFeedback(`Not quite right. Try again!`);
      logger.logResponse(
        transactionId,
        `${problemId}_answer_input`,
        'submit',
        answer,
        'RESULT',
        {
          evaluation: 'INCORRECT',
          currentHintNumber: showHint ? 1 : 0,
          totalHintsAvailable: 1
        },
        'That\'s not the correct answer. Check your calculation.'
      );
    }
  };
  
  const handleHintRequest = () => {
    // Log hint request
    const hintTxId = logger.logInterfaceHintRequest(
      `${problemId}_hint_button`,
      'click',
      ''
    );
    
    // Show hint
    setShowHint(true);
    const hintText = `Try breaking down the problem: ${question}`;
    
    // Log hint response
    logger.logHintResponse(
      hintTxId,
      `${problemId}_hint_button`,
      'click',
      '',
      1,
      1,
      hintText
    );
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAnswer(value);
    
    // Log input changes (optional - might be too verbose)
    logger.logInterfaceAttempt(
      `${problemId}_answer_input`,
      'change',
      value,
      {
        problemId,
        eventType: 'input_change'
      }
    );
  };
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Math Problem</h3>
      <p>{question}</p>
      
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={answer}
          onChange={handleInputChange}
          placeholder="Enter your answer"
          disabled={isCorrect}
          style={{ marginRight: '10px' }}
        />
        
        <button type="submit" disabled={isCorrect}>
          Submit
        </button>
        
        {!isCorrect && attempts > 0 && (
          <button type="button" onClick={handleHintRequest} style={{ marginLeft: '10px' }}>
            Get Hint
          </button>
        )}
      </form>
      
      {feedback && (
        <p style={{ color: isCorrect ? 'green' : 'red' }}>
          {feedback}
        </p>
      )}
      
      {showHint && !isCorrect && (
        <p style={{ color: 'blue', fontStyle: 'italic' }}>
          Hint: Try breaking down the problem step by step.
        </p>
      )}
      
      <p style={{ fontSize: '12px', color: '#666' }}>
        Attempts: {attempts}
      </p>
    </div>
  );
};

// Example app component
export const MathTutorApp: React.FC = () => {
  const configuration = {
    log_service_url: 'https://pslc-qa.andrew.cmu.edu/log/server',
    dataset_name: 'ReactMathTutor',
    problem_name: 'AdditionPractice',
    class_name: 'React Demo',
    school_name: 'Online School',
    instructor_name: 'React Teacher'
  };
  
  return (
    <DataShopLoggerProvider configuration={configuration}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h1>Math Tutor - React Example</h1>
        
        <MathProblem
          question="What is 5 + 3?"
          correctAnswer={8}
          problemId="problem_1"
        />
        
        <div style={{ marginTop: '20px' }}>
          <MathProblem
            question="What is 12 + 7?"
            correctAnswer={19}
            problemId="problem_2"
          />
        </div>
      </div>
    </DataShopLoggerProvider>
  );
};

// Export everything
export default MathTutorApp;