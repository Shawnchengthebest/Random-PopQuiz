///////////////////////
// Welcome to Cursor //
///////////////////////

/*
Step 1: Try generating a react component that lets you play tictactoe with Cmd+K or Ctrl+K on a new line.
  - Then integrate it into the code below and run with npm start

Step 2: Try highlighting all the code with your mouse, then hit Cmd+k or Ctrl+K. 
  - Instruct it to change the game in some way (e.g. add inline styles, add a start screen, make it 4x4 instead of 3x3)

Step 3: Hit Cmd+L or Ctrl+L and ask the chat what the code does

Step 4: To try out cursor on your own projects, go to the file menu (top left) and open a folder.
*/


import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import reportWebVitals from './reportWebVitals';

// Set the document title
document.title = 'Random Popquiz';

const nerdEmojis = ['🤓', '🧠', '👨‍🔬', '👩‍🔬', '🤖', '💻', '📚'];

function NerdBackground() {
  const [emojis, setEmojis] = useState([]);

  useEffect(() => {
    const numberOfEmojis = nerdEmojis.length * 4; // 4x more emojis
    const newEmojis = [];

    for (let i = 0; i < numberOfEmojis; i++) {
      newEmojis.push({
        emoji: nerdEmojis[i % nerdEmojis.length],
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 5 + 10}s`, // 10-15s duration
        fontSize: `${Math.random() * 40 + 40}px`, // 40px to 80px
      });
    }

    setEmojis(newEmojis);
  }, []);

  return (
    <div className="nerd-background">
      {emojis.map((emojiData, index) => (
        <span 
          key={index} 
          className="falling-emoji" 
          style={{
            left: emojiData.left,
            animationDelay: emojiData.animationDelay,
            animationDuration: emojiData.animationDuration,
            fontSize: emojiData.fontSize,
          }}
        >
          {emojiData.emoji}
        </span>
      ))}
    </div>
  );
}

function App() {
  const [gameState, setGameState] = useState('start'); // 'start', 'countdown', or 'quiz'
  const [countdown, setCountdown] = useState(5);

  const handleStart = () => {
    setGameState('countdown');
  };

  useEffect(() => {
    let timer;
    if (gameState === 'countdown' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('quiz');
    }
    return () => clearTimeout(timer);
  }, [gameState, countdown]);

  return (
    <div className="App">
      <NerdBackground />
      {gameState === 'start' && (
        <div className="App-header">
          <h1>Random Popquiz</h1>
          <button onClick={handleStart} className="start-button">
            Click to start
          </button>
        </div>
      )}
      {gameState === 'countdown' && (
        <div className="countdown-container">
          <h2>Get Ready!</h2>
          <div className="countdown">{countdown}</div>
        </div>
      )}
      {gameState === 'quiz' && <Quiz />}
    </div>
  );
}

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [quizEnded, setQuizEnded] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !quizEnded) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !quizEnded) {
      setQuizEnded(true);
    }
  }, [timeLeft, quizEnded]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('https://opentdb.com/api.php?amount=10&difficulty=medium');
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      const fetchedQuestions = data.results.map(q => ({
        question: decodeEntities(q.question),
        answers: [...q.incorrect_answers, q.correct_answer].map(decodeEntities),
        correct: decodeEntities(q.correct_answer)
      }));
      fetchedQuestions.forEach(q => shuffleArray(q.answers));
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const decodeEntities = (text) => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  };

  const checkAnswer = (answer) => {
    setSelectedAnswer(answer);
    const currentQ = questions[currentQuestion];
    const correct = answer === currentQ.correct;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }

    // Wait for a moment before moving to the next question
    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(40); // Reset timer for next question
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setQuizEnded(true);
      }
    }, 1000); // Wait for 1 second
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(40);
    setQuizEnded(false);
    fetchQuestions();
  };

  if (questions.length === 0) {
    return <div>Loading questions...</div>;
  }

  if (quizEnded) {
    return (
      <div className="quiz-container">
        <h2>{score > 5 ? 'Congratulations!' : 'Quiz Completed'}</h2>
        <p>Your final score is: {score} / {questions.length}</p>
        <button className="try-again-btn" onClick={restartQuiz}>
          Try Again
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="quiz-container">
      <div className="score-timer-container">
        <div id="score">Score: {score} / {questions.length}</div>
        <div id="timer">Time: {timeLeft}</div>
      </div>
      <div className="question">
        <h2>Question {currentQuestion + 1}:</h2>
        <p>{question.question}</p>
        <div className="answers">
          {question.answers.map((answer, index) => (
            <button
              key={index}
              onClick={() => checkAnswer(answer)}
              className={`
                ${selectedAnswer === answer ? (isCorrect ? 'correct' : 'incorrect') : ''}
                ${selectedAnswer && answer === question.correct ? 'correct' : ''}
              `}
              disabled={selectedAnswer !== null}
            >
              {answer}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// reportWebVitals();