import { useState } from "react";
import { useDataShopLogger } from "@/lib/DataShopLoggerContext";
import Head from "next/head";

// Question data
const multipleChoiceQuestions = [
  {
    id: "q1",
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris",
  },
  {
    id: "q2",
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4",
  },
  {
    id: "q3",
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: "Mars",
  },
];

const openEndedQuestions = [
  {
    id: "q4",
    question:
      "Describe your favorite learning experience and what made it memorable.",
  },
  {
    id: "q5",
    question: "What strategies do you use to remember new information?",
  },
];

// Multiple Choice Question Component
function MultipleChoiceQuestion({
  question,
}: {
  question: (typeof multipleChoiceQuestions)[0];
}) {
  const { logAction, logResponse } = useDataShopLogger();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    isCorrect: boolean;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAnswer) return;

    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);

    // Log the student's attempt
    const transactionId = logAction(question.id, "ATTEMPT", selectedAnswer, {
      question_type: "multiple_choice",
      question_text: question.question,
      attempt_number: newAttemptCount.toString(),
    });

    console.log({ transactionId, attemptCount: newAttemptCount });

    // Check if answer is correct
    const answerIsCorrect = selectedAnswer === question.correctAnswer;
    setIsCorrect(answerIsCorrect);

    // Log the tutor's response
    if (transactionId) {
      logResponse({
        transactionId,
        selection: question.id,
        action: "ATTEMPT",
        input: selectedAnswer,
        outcome: answerIsCorrect ? "CORRECT" : "INCORRECT",
        semanticName: "RESULT",
        feedback: answerIsCorrect
          ? "Correct! Well done!"
          : newAttemptCount < 3 
            ? "Not quite. Try again!"
            : `Incorrect. The correct answer is ${question.correctAnswer}`,
        customFields: {
          question_type: "multiple_choice",
          correct_answer: question.correctAnswer,
          attempt_number: newAttemptCount.toString(),
        },
      });
    }

    // Update UI with feedback
    setFeedback({
      message: answerIsCorrect
        ? "Correct! Well done!"
        : newAttemptCount < 3 
          ? "Not quite. Try again!"
          : `Incorrect. The correct answer is ${question.correctAnswer}`,
      isCorrect: answerIsCorrect,
    });

    // Clear selection for next attempt if incorrect and attempts remaining
    if (!answerIsCorrect && newAttemptCount < 3) {
      setSelectedAnswer(null);
      setTimeout(() => setFeedback(null), 2000); // Clear feedback after 2 seconds
    }
  };

  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
      <form onSubmit={handleSubmit}>
        <div className="space-y-2 mb-4">
          {question.options.map((option) => (
            <label
              key={option}
              className={`block p-3 rounded cursor-pointer transition-colors ${
                selectedAnswer === option
                  ? "bg-blue-100 border-2 border-blue-500"
                  : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
              } ${
                feedback && option === question.correctAnswer
                  ? "bg-green-100 border-green-500"
                  : ""
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={selectedAnswer === option}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                className="mr-2"
                disabled={!!feedback && (isCorrect || attemptCount >= 3)}
              />
              {option}
            </label>
          ))}
        </div>
        {(attemptCount === 0 || (!isCorrect && attemptCount < 3)) && !feedback && (
          <button
            type="submit"
            disabled={!selectedAnswer}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Submit {attemptCount > 0 ? `(Attempt ${attemptCount + 1})` : ''}
          </button>
        )}
        {feedback && (
          <div
            className={`mt-4 p-3 rounded ${
              feedback.isCorrect
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {feedback.message}
          </div>
        )}
      </form>
    </div>
  );
}

// Open-Ended Question Component
function OpenEndedQuestion({
  question,
}: {
  question: (typeof openEndedQuestions)[0];
}) {
  const { logAction, logResponse } = useDataShopLogger();
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!answer.trim()) return;

    // Log the student's response
    const transactionId = logAction(question.id, "SUBMIT", answer, {
      question_type: "open_ended",
      question_text: question.question,
      response_length: answer.length.toString(),
    });

    // Log acknowledgment
    if (transactionId) {
      logResponse({
        transactionId,
        selection: question.id,
        action: "SUBMIT",
        input: answer,
        outcome: "SUBMITTED",
        semanticName: "RESULT",
        feedback: "Thank you for your response!",
        customFields: {
          question_type: "open_ended",
        },
      });
    }

    setSubmitted(true);
  };

  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full p-3 border rounded-lg resize-none focus:border-blue-500 focus:outline-none"
          rows={4}
          placeholder="Type your answer here..."
          disabled={submitted}
        />
        {!submitted && (
          <button
            type="submit"
            disabled={!answer.trim()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        )}
        {submitted && (
          <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded">
            Thank you for your response!
          </div>
        )}
      </form>
    </div>
  );
}

// Main Page Component
export default function Home() {
  const { sessionId, isInitialized, clearSession } = useDataShopLogger();

  return (
    <>
      <Head>
        <title>DataShop Logger Next.js Example</title>
        <meta
          name="description"
          content="Next.js example using DataShop Logger React SDK"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">
            DataShop Logger Next.js Example
          </h1>

          {/* Session Info */}
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Session Information</h2>
            <p className="text-gray-600">
              Status:{" "}
              <span className="font-medium">
                {isInitialized ? "Initialized" : "Not initialized"}
              </span>
            </p>
            <p className="text-gray-600">
              Session ID:{" "}
              <span className="font-mono text-sm">{sessionId || "None"}</span>
            </p>
            <button
              onClick={clearSession}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear Session
            </button>
          </div>

          {/* Quiz Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Quiz Questions</h2>

            {/* Multiple Choice Questions */}
            {multipleChoiceQuestions.map((q) => (
              <MultipleChoiceQuestion key={q.id} question={q} />
            ))}

            {/* Open-Ended Questions */}
            {openEndedQuestions.map((q) => (
              <OpenEndedQuestion key={q.id} question={q} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
