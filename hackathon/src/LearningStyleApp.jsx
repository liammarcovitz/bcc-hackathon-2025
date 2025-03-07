import { useState } from "react";
import QuizPage from "./QuizPage";

export default function LearningStyleApp() {
  const [selectedOption, setSelectedOption] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "20px", position: "relative" }}>
      {showQuiz ? (
        <QuizPage />
      ) : (
        <>
          {/* Login Section */}
          <div style={{ position: "absolute", top: "10px", right: "10px" }}>
            {isLoggedIn ? (
              <p>Welcome back!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "white", padding: "15px", borderRadius: "8px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                />
                <button onClick={handleLogin} style={{ padding: "8px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Log In</button>
                <p style={{ fontSize: "12px", color: "#6b7280" }}>Not a member? Sign up instead.</p>
              </div>
            )}
          </div>
          
          {/* Learning Style Section */}
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Get your learning style</h1>
          <div style={{ display: "flex", gap: "15px" }}>
            {[
              { type: "Auditory", desc: "You will receive an audio file based on your input." },
              { type: "Visual", desc: "You will receive a video based on your input." },
              { type: "Text", desc: "You will receive text-based content based on your input." },
            ].map((option) => (
              <div 
                key={option.type} 
                style={{ padding: "15px", border: `2px solid ${selectedOption === option.type ? "#3b82f6" : "#d1d5db"}`, borderRadius: "8px", backgroundColor: "white", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", width: "200px", textAlign: "center" }}
              >
                <h2 style={{ fontSize: "18px", fontWeight: "600" }}>{option.type}</h2>
                <p style={{ fontSize: "14px", color: "#6b7280" }}>{option.desc}</p>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setShowQuiz(true)}
            style={{ marginTop: "20px", padding: "10px 15px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Get your learning style
          </button>
        </>
      )}
    </div>
  );
}
