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
  const handleStart = () => {
    const quizWindow = window.open('', '_blank');
    quizWindow.document.write(`
      <html>
        <head>
          <title>Random Popquiz</title>
          <style>
            body {
              background-color: #FFFF00;
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              transition: background-color 0.5s ease;
            }
            #countdown {
              font-size: 100px;
              color: black;
              text-align: center;
            }
            #quiz-content {
              display: none;
              width: 100%;
              max-width: 600px;
            }
            h1 {
              color: black;
              text-align: center;
            }
            .question {
              background-color: #E6D000;
              border-radius: 10px;
              padding: 20px;
              margin-bottom: 20px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            button {
              display: block;
              width: 100%;
              padding: 10px;
              margin-top: 10px;
              background-color: rgba(255, 255, 255, 0.6);
              color: black;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              transition: background-color 0.3s;
            }
            button:hover {
              background-color: rgba(255, 255, 255, 0.8);
            }
            .correct {
              background-color: rgba(76, 175, 80, 0.8) !important;
            }
            .incorrect {
              background-color: rgba(244, 67, 54, 0.8) !important;
            }
            #score {
              position: fixed;
              top: 20px;
              right: 20px;
              background-color: rgba(0, 0, 0, 0.7);
              color: white;
              padding: 10px 15px;
              border-radius: 5px;
              font-size: 18px;
              font-weight: bold;
              z-index: 1000;
            }
            #timer {
              position: fixed;
              bottom: 20px;
              right: 20px;
              background-color: rgba(0, 0, 0, 0.7);
              color: white;
              padding: 10px 15px;
              border-radius: 5px;
              font-size: 18px;
              font-weight: bold;
              z-index: 1000;
            }

            .confetti {
              position: absolute;
              width: 10px;
              height: 10px;
              background-color: #f2d74e;
              opacity: 0;
            }

            @keyframes confetti-fall {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }

            .try-again-btn {
              display: inline-block;
              padding: 10px 20px;
              font-size: 16px;
              background-color: #4CAF50;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              transition: background-color 0.3s;
            }

            .try-again-btn:hover {
              background-color: #45a049;
            }
          </style>
        </head>
        <body>
          <div id="score">Score: 0 / 0</div>
          <div id="timer">Time: 40</div>
          <div id="countdown">3</div>
          <div id="quiz-content">
            <h1>Random Popquiz</h1>
            <div id="question-container"></div>
          </div>
          <script>
            let questions = [];
            let currentQuestion = 0;
            let score = 0;
            let timer;
            let timeLeft = 40;

            async function fetchQuestions() {
              try {
                const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
                if (!response.ok) {
                  throw new Error('Failed to fetch questions');
                }
                const data = await response.json();
                questions = data.results.map(q => ({
                  question: q.question,
                  answers: [...q.incorrect_answers, q.correct_answer],
                  correct: q.correct_answer
                }));
                questions.forEach(q => shuffleArray(q.answers));
                shuffleArray(questions);
                updateScore();
                startQuiz();
              } catch (error) {
                console.error('Error fetching questions:', error);
                document.getElementById('question-container').innerHTML = '<p>Failed to load questions. Please try again later.</p>';
              }
            }

            function shuffleArray(array) {
              for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
              }
            }

            function startQuiz() {
              document.getElementById('countdown').style.display = 'none';
              document.getElementById('quiz-content').style.display = 'block';
              showQuestion();
              startTimer();
            }

            function showQuestion() {
              document.body.style.backgroundColor = '#FFFF00';
              const questionContainer = document.getElementById('question-container');
              const question = questions[currentQuestion];
              let html = \`
                <div class="question">
                  <h2>Question \${currentQuestion + 1}:</h2>
                  <p>\${decodeEntities(question.question)}</p>
                  \${question.answers.map(answer => \`
                    <button onclick="checkAnswer(this, '\${question.correct}')">\${decodeEntities(answer)}</button>
                  \`).join('')}
                </div>
              \`;
              questionContainer.innerHTML = html;
              timeLeft = 40;
              updateTimer();
            }

            function decodeEntities(text) {
              const textArea = document.createElement('textarea');
              textArea.innerHTML = text;
              return textArea.value;
            }

            function checkAnswer(button, correctAnswer) {
              clearInterval(timer);
              const buttons = button.parentElement.getElementsByTagName('button');
              for (let btn of buttons) {
                btn.disabled = true;
                if (btn.textContent === correctAnswer) {
                  btn.classList.add('correct');
                }
              }
              if (button.textContent === correctAnswer) {
                score++;
                button.classList.add('correct');
              } else {
                button.classList.add('incorrect');
              }
              updateScore();
              setTimeout(nextQuestion, 2000);
            }

            function nextQuestion() {
              currentQuestion++;
              if (currentQuestion < questions.length) {
                showQuestion();
                startTimer();
              } else {
                endQuiz();
              }
            }

            function startTimer() {
              timer = setInterval(() => {
                timeLeft--;
                updateTimer();
                if (timeLeft === 0) {
                  clearInterval(timer);
                  document.body.style.backgroundColor = '#B8B800';
                  setTimeout(() => {
                    nextQuestion();
                  }, 1000);
                }
              }, 1000);
            }

            function updateTimer() {
              document.getElementById('timer').textContent = \`Time: \${timeLeft}\`;
            }

            function updateScore() {
              document.getElementById('score').textContent = \`Score: \${score} / \${questions.length}\`;
            }

            function endQuiz() {
              clearInterval(timer);
              document.getElementById('timer').style.display = 'none';
              
              if (score > 5) {
                document.getElementById('question-container').innerHTML = \`
                  <h2>Congratulations!</h2>
                  <p>Your final score is: \${score} / \${questions.length}</p>
                \`;
                createConfetti();
              } else {
                document.getElementById('question-container').innerHTML = \`
                  <h2>Quiz Completed</h2>
                  <p>Your final score is: \${score} / \${questions.length}</p>
                  <p>Better luck next time!</p>
                  <button class="try-again-btn" onclick="restartQuiz()">Try Again</button>
                \`;
              }
            }

            function createConfetti() {
              const confettiCount = 200;
              const colors = ['#f2d74e', '#95c3de', '#ff9a91', '#f2b2f2', '#cefc86'];

              for (let i = 0; i < confettiCount; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
                confetti.style.animationDelay = Math.random() * 5 + 's';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animation = 'confetti-fall linear forwards';
                document.body.appendChild(confetti);

                setTimeout(() => {
                  document.body.removeChild(confetti);
                }, 5000);
              }
            }

            function restartQuiz() {
              currentQuestion = 0;
              score = 0;
              updateScore();
              fetchQuestions();
            }

            let count = 3;
            const countdownElement = document.getElementById('countdown');
            
            function updateCountdown() {
              countdownElement.textContent = count;
              if (count > 0) {
                count--;
                setTimeout(updateCountdown, 1000);
              } else {
                fetchQuestions();
              }
            }
            
            updateCountdown();
          </script>
        </body>
      </html>
    `);
  };

  return (
    <div className="App">
      <NerdBackground />
      <div className="App-header">
        <h1>Random Popquiz</h1>
        <button onClick={handleStart} className="start-button">
          Click to start
        </button>
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