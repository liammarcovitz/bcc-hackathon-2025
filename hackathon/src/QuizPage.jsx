import React, { useState } from "react";
import "./QuizPage.css";

const questions = [
  { question: "What kind of book would you like to read for fun?", options: ["A book with lots of pictures in it", "A book with lots of words in it", "A book with word searches or crosswords puzzles"], type: ["Visual", "Game", "Auditory"] },
  { question: "When you are not sure how to spell a word, what are you most likely to do?", options: ["Write it down and see if it looks right", "Spell it out and see if it sounds right", "Trace the letters in the air (finger spelling)"] , type: ["Visual", "Auditory", "Game"] },
  { question: "You're out shopping for clothes, and you're waiting in line to pay. What are you most likely to do while you are waiting?", options: ["Look around at other clothes on the racks", "Talk to the person next to you in line", "Fidget or move back and forth"], type: ["Visual", "Auditory", "Game"] },
  { question: "When you see the word 'cat,' what do you do first?", options: ["Picture a cat in your mind", "Say the word 'cat' to yourself", "Think about being with a cat (petting it or hearing it purr)"] , type: ["Visual", "Auditory", "Game"] },
  { question: "What's the best way for you to study for a test?", options: ["Read the book or your notes and review pictures or charts", "Have someone ask you questions that you can ask out loud", "Make up index cards that you can review"], type: ["Visual", "Auditory", "Game"] },
  { question: "What's the best way for you to learn about how something works (like a computer or a video game)?", options: ["Get someone to show you", "Read about it or listen to someone explain it", "Figure it out on your own"], type: ["Visual", "Auditory", "Game"] },
  { question: "When learning a new skill, what helps you most?", options: ["Watching someone do it", "Listening to verbal instructions", "Trying it hands-on"], type: ["Visual", "Auditory", "Game"] },
  { question: "How do you remember phone numbers best?", options: ["Seeing them written down", "Repeating them out loud", "Typing them several times"], type: ["Visual", "Auditory", "Game"] },
  { question: "When watching a presentation, what keeps you engaged?", options: ["Slides with pictures", "Listening to the speaker", "Interacting with objects or demonstrations"], type: ["Visual", "Auditory", "Game"] },
  { question: "What do you do when trying to recall a memory?", options: ["Visualize the scene", "Talk about it out loud", "Act out parts of the memory"], type: ["Visual", "Auditory", "Game"] },
  { question: "When following directions, what works best for you?", options: ["Looking at a map or diagram", "Listening to spoken instructions", "Writing them down step-by-step"], type: ["Visual", "Auditory", "Game"] },
  { question: "How do you prefer to learn a new language?", options: ["Watching videos and images", "Listening to native speakers", "Writing and reading practice"], type: ["Visual", "Auditory", "Game"] },
  { question: "What helps you relax the most?", options: ["Watching a calming scene", "Listening to soothing music", "Doing a relaxing activity"], type: ["Visual", "Auditory", "Game"] },
  { question: "What is your preferred way to take notes?", options: ["Using diagrams and color coding", "Recording voice memos", "Writing detailed bullet points"], type: ["Visual", "Auditory", "Game"] },
  { question: "When giving a speech, how do you prepare?", options: ["Using visual cues and slides", "Practicing out loud", "Writing and reading through notes"], type: ["Visual", "Auditory", "Game"] },
  { question: "If learning dance moves, how do you pick them up?", options: ["Watching and copying", "Listening to verbal instructions", "Practicing with guidance"], type: ["Visual", "Auditory", "Game"] },
  { question: "What is your favorite way to experience a story?", options: ["Watching a movie", "Listening to an audiobook", "Reading a novel"], type: ["Visual", "Auditory", "Game"] },
  { question: "How do you prefer to receive feedback?", options: ["Seeing written comments", "Hearing verbal feedback", "Trying suggestions hands-on"], type: ["Visual", "Auditory", "Game"] },
  { question: "When assembling furniture, what do you rely on?", options: ["Diagrams and images", "Instructional videos or spoken steps", "Trial and error by building it"], type: ["Visual", "Auditory", "Game"] },
  { question: "When remembering people's names, what helps most?", options: ["Seeing the name written down", "Hearing it repeated", "Associating it with a motion or action"], type: ["Visual", "Auditory", "Game"] },
];

export default function QuizPage({ submit }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleOptionSelect = (type) => {
    setSelectedAnswer((prev) => (prev === type ? null : type));
  };

  const handleNext = () => {
    if (selectedAnswer) {
      setAnswers([...answers, selectedAnswer]);
      setSelectedAnswer(null);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      }
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer) {
      setAnswers([...answers, selectedAnswer]);
      setQuizCompleted(true);
      submit(answers);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  const getLearningStyle = () => {
    const counts = { Visual: 0, Auditory: 0, Game: 0 }; // Updated to include "Game"
    answers.forEach((answer) => {
      counts[answer]++; // Count the occurrences of each type
    });

    return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b)); // Return the one with the most occurrences
  };

  if (quizCompleted) {
    const learningStyle = getLearningStyle();
    return (
      <div className="quiz-container">
        <h2>You are a {learningStyle} learner!</h2>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <h2>Question {currentQuestion + 1} of {questions.length}</h2>
      <p>{questions[currentQuestion].question}</p>
      <div className="options">
        {questions[currentQuestion].options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(questions[currentQuestion].type[index])}
            className={selectedAnswer === questions[currentQuestion].type[index] ? "selected" : ""}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="navigation">
        <button onClick={handleBack} disabled={currentQuestion === 0}>Back</button>
        {currentQuestion === questions.length - 1 ? (
          <button onClick={handleSubmit} disabled={!selectedAnswer}>Submit</button>
        ) : (
          <button onClick={handleNext} disabled={!selectedAnswer}>Next Question</button>
        )}
      </div>
    </div>
  );
}