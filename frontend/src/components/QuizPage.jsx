// Create a new file, e.g., components/QuizPage.jsx

import { useState } from 'react';
import Quiz from './Quiz'; // Adjust path if needed
import Analytics from './Analytics'; // Adjust path if needed

// Assuming 'session', 'idToken', and 'profile' are passed as props to this page
export default function QuizPage({ session, idToken, profile }) {
  // 1. State to hold the quiz results (history)
  const [history, setHistory] = useState([]);
  
  // 2. State to track if the quiz is finished
  const [quizComplete, setQuizComplete] = useState(false);

  // 3. This function is passed to the Quiz component
  // It receives the final 'answers' and updates the state
  const handleQuizComplete = (finalAnswers) => {
    console.log("Quiz finished! Final answers:", finalAnswers); // Debugging line
    setHistory(finalAnswers);
    setQuizComplete(true);
  };

  // Function to restart the quiz
  const handleRestart = () => {
    setHistory([]);
    setQuizComplete(false);
  };

  return (
    <div>
      {quizComplete ? (
        // If quiz is done, show Analytics with the history
        <div>
          <Analytics history={history} />
          <div className="text-center mt-4">
            <button 
              onClick={handleRestart} 
              className="px-6 py-2 rounded-xl bg-purple-600 text-white font-semibold"
            >
              Take Another Quiz
            </button>
          </div>
        </div>
      ) : (
        // Otherwise, show the Quiz and pass the completion handler
        <Quiz
          session={session}
          idToken={idToken}
          profile={profile}
          onComplete={handleQuizComplete} 
        />
      )}
    </div>
  );
}