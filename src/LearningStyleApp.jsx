import { useState } from "react";
import QuizPage from "./QuizPage";

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.REACT_APP_OPEN_AI_API_KEY;

export default function LearningStyleApp() {
  const [selectedOption, setSelectedOption] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);
  const [learningStyleResult, setLearningStyleResult] = useState(null);
  const [selectedLearningStyle, setSelectedLearningStyle] = useState(null);
  const [topic, setTopic] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleQuizSubmit = async (answers) => {
    const prompt = `Based on the following answers, determine the user's learning style:\n${answers} \nOnly return either "Auditory", "Game", or "Visual" nothing else and only one of them. Return what is the most (dont return any special characters like a new line like \\n).`;
    
    console.log("Sending prompt to API:", prompt);
  
    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                }
              ]
            }
          ],
        }),
      });
  
      const data = await response?.json();
      console.log("API Response:", data);
  
      if (data?.candidates?.[0]?.content?.parts?.[0].text) {
        const learningStyle = data?.candidates?.[0]?.content?.parts?.[0].text;
        console.log("Learning Style: ", learningStyle);
    
        setLearningStyleResult(learningStyle.replace('\n', ''));
      } else {
        console.error("Invalid API response structure");
      }
    } catch (error) {
      console.error("Error fetching API:", error);
    }
  };

  const handleLearningStyleSelect = (type) => {
    setSelectedLearningStyle(type);
  };

  const handleTopicChange = (e) => {
    setTopic(e.target.value);
  };

  const generateContent = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic to learn about.");
      return;
    }

    setIsLoading(true);

    try {
      const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Write a short paragraph (about 100 words) explaining the topic: ${topic}`,
            },
          ],
        }),
      });

      const gptData = await gptResponse.json();
      if (!gptResponse.ok) {
        throw new Error("Failed to generate text.");
      }

      const generatedParagraph = gptData.choices[0].message.content;
      setGeneratedText(generatedParagraph);

      if (selectedLearningStyle === "Visual") {
        const dalleResponse = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: `A realistic image of: ${topic}`,
            n: 1,
            size: "1024x1024",
          }),
        });

        const dalleData = await dalleResponse.json();
        if (!dalleResponse.ok) {
          throw new Error("Failed to generate image.");
        }

        const imageUrl = dalleData.data[0].url;
        setImageUrl(imageUrl);
      }

      if (selectedLearningStyle === "Auditory") {
        const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "tts-1",
            input: generatedParagraph,
            voice: "alloy",
          }),
        });

        if (!ttsResponse.ok) {
          throw new Error("Failed to generate audio.");
        }

        const blob = await ttsResponse.blob();
        const audioUrl = URL.createObjectURL(blob);
        setAudioUrl(audioUrl);
      }
    } catch (error) {
      console.error("Error generating content:", error);
      alert("Failed to generate content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#f6f8fa", padding: "20px", position: "relative" }}>
      {showQuiz ? (
        <QuizPage submit={handleQuizSubmit} />
      ) : (
        <>
          {isLoggedIn ? (
            <p style={{ fontSize: "18px", color: "#01002a" }}>Welcome back!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#eaffff", padding: "20px", borderRadius: "12px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: "10px", border: "1px solid #a2b6cb", borderRadius: "8px", fontSize: "16px" }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ padding: "10px", border: "1px solid #a2b6cb", borderRadius: "8px", fontSize: "16px" }}
              />
              <button onClick={handleLogin} style={{ padding: "12px", backgroundColor: "#01002a", color: "#eaffff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", transition: "background-color 0.3s ease" }}>Log In</button>
              <p style={{ fontSize: "12px", color: "#6b7280" }}>Not a member? Sign up instead.</p>
            </div>
          )}
          <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px", color: "#01002a" }}>Get your learning style</h1>
          <div style={{ display: "flex", gap: "15px" }}>
            {[
              { type: "Auditory", desc: "You will receive an audio file based on your input." },
              { type: "Visual", desc: "You will receive an image and text explanation based on your input." },
              { type: "Game", desc: "You will play an interactive 2D game to learn." },
            ].map((option) => (
              <div
                key={option.type}
                onClick={() => setSelectedOption(option.type)}
                style={{
                  padding: "20px",
                  border: `2px solid ${selectedOption === option.type ? "#01002a" : "#a2b6cb"}`,
                  borderRadius: "12px",
                  cursor: "pointer",
                  backgroundColor: "#eaffff",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  width: "200px",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                }}
              >
                <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#01002a" }}>{option.type}</h2>
                <p style={{ fontSize: "14px", color: "#6b7280" }}>{option.desc}</p>
              </div>
            ))}
          </div>
          <button
            disabled={!selectedOption}
            onClick={() => setShowQuiz(true)}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              backgroundColor: selectedOption ? "#01002a" : "#a2b6cb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: selectedOption ? "pointer" : "not-allowed",
              fontSize: "16px",
              transition: "background-color 0.3s ease",
            }}
          >
            Get your learning style
          </button>
        </>
      )}

      {learningStyleResult && (
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#01002a" }}>You are...</h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
            {[
              { type: "Auditory", desc: "You will receive an audio file based on your input." },
              { type: "Visual", desc: "You will receive an image and text explanation based on your input." },
              { type: "Game", desc: "You will play an interactive 2D game to learn." },
            ].map((option) => (
              <div
                key={option.type}
                onClick={() => handleLearningStyleSelect(option.type)}
                style={{
                  padding: "20px",
                  border: `2px solid ${selectedLearningStyle === option.type ? "#01002a" : "#a2b6cb"}`,
                  borderRadius: "12px",
                  cursor: "pointer",
                  backgroundColor: selectedLearningStyle === option.type ? "#01002a" : "#eaffff",
                  color: selectedLearningStyle === option.type ? "#eaffff" : "#01002a",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  width: "200px",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                }}
              >
                <h3 style={{ fontSize: "20px", fontWeight: "600" }}>{option.type}</h3>
                <p style={{ fontSize: "14px" }}>{option.desc}</p>
              </div>
            ))}
          </div>

          {(selectedLearningStyle === "Auditory" || selectedLearningStyle === "Visual") && (
            <div style={{ marginTop: "20px" }}>
              <input
                type="text"
                placeholder="Enter a topic to learn about"
                value={topic}
                onChange={handleTopicChange}
                style={{ padding: "10px", border: "1px solid #a2b6cb", borderRadius: "8px", fontSize: "16px", width: "300px" }}
              />
              <button
                onClick={generateContent}
                disabled={isLoading}
                style={{
                  marginTop: "10px",
                  padding: "12px 24px",
                  backgroundColor: "#01002a",
                  color: "#eaffff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  transition: "background-color 0.3s ease",
                }}
              >
                {isLoading ? "Generating..." : "Generate Content"}
              </button>
            </div>
          )}

          {generatedText && (
            <div style={{ marginTop: "20px", maxWidth: "600px", textAlign: "left" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#01002a" }}>Generated Text:</h3>
              <p style={{ fontSize: "16px", color: "#01002a" }}>{generatedText}</p>
            </div>
          )}

          {selectedLearningStyle === "Visual" && imageUrl && (
            <div style={{ marginTop: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#01002a" }}>Generated Image:</h3>
              <img src={imageUrl} alt="Generated Image" style={{ maxWidth: "100%", borderRadius: "12px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }} />
            </div>
          )}

          {selectedLearningStyle === "Auditory" && audioUrl && (
            <div style={{ marginTop: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#01002a" }}>Listen to the Voice Message:</h3>
              <audio controls src={audioUrl} style={{ width: "100%" }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}