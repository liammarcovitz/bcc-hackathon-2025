## **Learning Newtron**  

### **This project won 2nd place in the Education topic and 1st place in the category of Best Use of AI in BCC Hackathon 7th of March, 2025**

This is a React-based application that determines a user's learning style (Auditory, Visual, or Game) through a quiz. Based on the learning style, the app generates personalized learning content using OpenAI's GPT, DALL·E, and Text-to-Speech (TTS) APIs.  

## **Features**  
✅ User login system (email & password)  
✅ Quiz to determine the user's learning style  
✅ AI-generated content based on learning style  
✅ Supports three learning styles:  
   - **Auditory** → Generates an AI-generated voice message  
   - **Visual** → Generates an image and text explanation  
   - **Game** → Plans to integrate an interactive learning game  
✅ Uses OpenAI APIs for text, images, and audio generation  

---

## **Tech Stack**  
- **Frontend:** React.js (useState, hooks)  
- **AI Services:**  
  - Google Gemini API (for quiz analysis)  
  - OpenAI GPT-3.5 Turbo (for text generation)  
  - OpenAI DALL·E (for image generation)  
  - OpenAI TTS (for voice generation)  
- **Styling:** Inline CSS  

---

## **Setup & Installation**  

### **1. Clone the Repository**  
```sh
git clone https://github.com/your-username/learning-style-app.git
cd learning-style-app
```

### **2. Install Dependencies**  
```sh
npm install
```

### **3. Create a `.env` File**  
In the root directory, create a `.env` file and add your API keys:  

```env
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
REACT_APP_OPEN_AI_API_KEY=your_openai_api_key
```

### **4. Start the Development Server**  
```sh
npm start
```

The app will run on `http://localhost:3000/`.  

---

## **Usage**  

1. **Log in** with any email and password (no authentication is implemented yet).  
2. **Take the quiz** to determine your learning style.  
3. Based on your learning style:  
   - **Auditory** → Enter a topic and get an AI-generated voice message.  
   - **Visual** → Enter a topic and get an AI-generated image + explanation.  
   - **Game** → (Feature planned for future updates).  

---

## **Project Structure**  

```
/learning-style-app
│── /src
│   ├── QuizPage.js
│   ├── LearningStyleApp.js
│   │── App.js
│   │── index.js
│── .env
│── package.json
│── README.md
```
---

## **License**  
This project is for educational purposes and is **MIT Licensed**.  
