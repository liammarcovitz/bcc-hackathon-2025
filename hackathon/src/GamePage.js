import React, { useEffect } from "react";

export default function GamePage({ topic }) {
  useEffect(() => {
    // Inject the game script into the component
    const script = document.createElement("script");
    script.type = "module";
    script.innerHTML = `
      import { GoogleGenerativeAI } from "https://cdn.skypack.dev/@google/generative-ai";

      async function callGemini(prompt) {
        const geminiApiKey = "AIzaSyBWW39YGsIOpLa4viuhVTT2I_qSjIbYWvY"; // Replace with your actual API key
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.debug("Calling Gemini API with prompt:", prompt);
        try {
          const result = await model.generateContent([prompt]); // Pass prompt as an array
          const output = await result.response.text(); // Await the response text
          console.debug("Gemini official output:", output);
          return output;
        } catch (error) {
          console.error("Error calling Gemini API:", error);
          return null;
        }
      }

      async function fetchInfoFromGemini(topic) {
        const prompt = \`Give me a small fact about \${topic}.\`;
        const fact = await callGemini(prompt);
        console.debug("Fetched Gemini fact:", fact);
        return fact || \`Default fact about \${topic}\`;
      }

      function extractQuestion(output) {
        const regex = /"question":\\s*"([^"]+)"/;
        const match = output.match(regex);
        return match ? match[1] : output;
      }

      async function generateQuestionFromGeminiFact(fact) {
        const prompt = \`Generate a quiz question based on this fact: "\${fact}". Format the response as JSON: {"question": "Question text", "answer": "Answer text"}.\`;
        const output = await callGemini(prompt);
        console.debug("Raw Gemini question output:", output);
        if (!output) {
          console.error("Received undefined output from Gemini for fact:", fact);
          return { question: "Fallback question: What is something interesting about the topic?", answer: "Fallback answer" };
        }
        try {
          const parsedOutput = JSON.parse(output);
          console.debug("Parsed Gemini question JSON:", parsedOutput);
          return parsedOutput;
        } catch (e) {
          console.error("Error parsing Gemini output as JSON:", e);
          const extractedQuestion = extractQuestion(output);
          return { question: extractedQuestion, answer: "Fallback answer" };
        }
      }

      const canvas = document.getElementById("gameCanvas");
      const ctx = canvas.getContext("2d");
      let maze = [];
      let mazeRows, mazeCols;
      let cellSize;
      let player = { x: 0, y: 0, score: 0, weapon: "Basic" };
      let infoBubbles = [];
      let enemies = [];
      let boss = null;
      let collectedQuestions = [];
      let collectedFacts = [];
      let gameState = "menu";
      const baseMazeSize = 10;
      let globalTopic = "${topic}";

      const playerIdleFrames = [];
      let playerCurrentFrame = 0;
      const playerFrameInterval = 200; // ms per frame
      let lastFrameTime = 0;

      function loadPlayerFrames() {
        const frameNames = [
          "Sprites/Player/knight_m_idle_anim_f0.png",
          "Sprites/Player/knight_m_idle_anim_f1.png",
          "Sprites/Player/knight_m_idle_anim_f2.png",
          "Sprites/Player/knight_m_idle_anim_f3.png"
        ];
        for (const name of frameNames) {
          const img = new Image();
          img.src = name;
          playerIdleFrames.push(img);
        }
      }
      loadPlayerFrames();

      function updatePlayerAnimation(timestamp) {
        if (!lastFrameTime) lastFrameTime = timestamp;
        if (timestamp - lastFrameTime > playerFrameInterval) {
          playerCurrentFrame = (playerCurrentFrame + 1) % playerIdleFrames.length;
          lastFrameTime = timestamp;
        }
      }

      const floorTexture = new Image();
      floorTexture.src = "Sprites/Environment/new_floor.png";
      let floorPattern = null;

      floorTexture.onload = () => {
        floorPattern = ctx.createPattern(floorTexture, "repeat");
      };

      function generateMaze(cols, rows) {
        let grid = [];
        for (let y = 0; y < rows; y++) {
          let row = [];
          for (let x = 0; x < cols; x++) {
            row.push({
              x, y,
              walls: [true, true, true, true],
              visited: false
            });
          }
          grid.push(row);
        }

        function index(x, y) {
          if (x < 0 || y < 0 || x >= cols || y >= rows) return null;
          return grid[y][x];
        }

        function removeWalls(a, b) {
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          if (dx === 1) {
            a.walls[3] = false; // left wall
            b.walls[1] = false; // right wall
          } else if (dx === -1) {
            a.walls[1] = false; // right wall
            b.walls[3] = false; // left wall
          }
          if (dy === 1) {
            a.walls[0] = false; // top wall
            b.walls[2] = false; // bottom wall
          } else if (dy === -1) {
            a.walls[2] = false; // bottom wall
            b.walls[0] = false; // top wall
          }
        }

        let stack = [];
        let current = grid[0][0];
        current.visited = true;

        while (true) {
          let neighbors = [];
          let top = index(current.x, current.y - 1);
          let right = index(current.x + 1, current.y);
          let bottom = index(current.x, current.y + 1);
          let left = index(current.x - 1, current.y);

          if (top && !top.visited) neighbors.push(top);
          if (right && !right.visited) neighbors.push(right);
          if (bottom && !bottom.visited) neighbors.push(bottom);
          if (left && !left.visited) neighbors.push(left);

          if (neighbors.length > 0) {
            let next = neighbors[Math.floor(Math.random() * neighbors.length)];
            next.visited = true;
            stack.push(current);
            removeWalls(current, next);
            current = next;
          } else if (stack.length > 0) {
            current = stack.pop();
          } else {
            break;
          }
        }
        return grid;
      }

      function drawMaze() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (floorPattern) {
          ctx.save();
          ctx.fillStyle = floorPattern;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
        }

        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;  // <--- Thicker line

        for (let row of maze) {
          for (let cell of row) {
            let x = cell.x * cellSize;
            let y = cell.y * cellSize;

            if (cell.walls[0]) {
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x + cellSize, y);
              ctx.stroke();
            }
            if (cell.walls[1]) {
              ctx.beginPath();
              ctx.moveTo(x + cellSize, y);
              ctx.lineTo(x + cellSize, y + cellSize);
              ctx.stroke();
            }
            if (cell.walls[2]) {
              ctx.beginPath();
              ctx.moveTo(x + cellSize, y + cellSize);
              ctx.lineTo(x, y + cellSize);
              ctx.stroke();
            }
            if (cell.walls[3]) {
              ctx.beginPath();
              ctx.moveTo(x, y + cellSize);
              ctx.lineTo(x, y);
              ctx.stroke();
            }
          }
        }
      }

      function drawPlayer() {
        const drawX = player.x * cellSize + cellSize / 4;
        const drawY = player.y * cellSize + cellSize / 4;
        if (playerIdleFrames.length > 0) {
          const frame = playerIdleFrames[playerCurrentFrame];
          const scale = (cellSize / 2) / frame.width;
          const scaledWidth = frame.width * scale;
          const scaledHeight = frame.height * scale;
          ctx.drawImage(frame, 0, 0, frame.width, frame.height,
            drawX, drawY, scaledWidth, scaledHeight);
        }
      }

      function drawBubbles() {
        for (let bubble of infoBubbles) {
          if (!bubble.collected) {
            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.arc(bubble.x * cellSize + cellSize / 2, bubble.y * cellSize + cellSize / 2, cellSize / 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      function drawEnemies() {
        ctx.fillStyle = "green";
        for (let enemy of enemies) {
          if (!enemy.defeated) {
            ctx.fillRect(enemy.x * cellSize + cellSize / 3, enemy.y * cellSize + cellSize / 3, cellSize / 3, cellSize / 3);
          }
        }
      }

      function drawBoss() {
        if (boss && !boss.defeated) {
          ctx.fillStyle = "purple";
          ctx.fillRect(boss.x * cellSize + cellSize / 4, boss.y * cellSize + cellSize / 4, cellSize / 2, cellSize / 2);
        }
      }

      async function checkCollisions() {
        for (let bubble of infoBubbles) {
          if (!bubble.collected && bubble.x === player.x && bubble.y === player.y) {
            bubble.collected = true;
            const fact = await fetchInfoFromGemini(bubble.topic);
            bubble.fact = fact;
            alert("New Knowledge: " + fact);
            collectedFacts.push(fact);
            player.score += 10;
            updateHUD();
          }
        }

        for (let enemy of enemies) {
          if (!enemy.defeated && enemy.x === player.x && enemy.y === player.y) {
            await handleEnemyEncounter(enemy);
            break;
          }
        }

        if (boss && !boss.defeated && boss.x === player.x && boss.y === player.y) {
          gameState = "bossBattle";
          let factForBoss = collectedFacts.length > 0 ? collectedFacts.shift() : globalTopic;
          const bossQ = await generateQuestionFromGeminiFact(factForBoss);
          const bossAnswer = prompt("Boss Battle! Answer this question to defeat the boss:\\n" + bossQ.question);
          if (bossAnswer && bossAnswer.toLowerCase() === bossQ.answer.toLowerCase()) {
            alert("Boss defeated!");
            boss.defeated = true;
            gameState = "finalQuiz";
            startFinalQuiz();
          } else {
            alert("Wrong answer! Try again later.");
            gameState = "playing";
          }
        }
      }

      async function handleEnemyEncounter(enemy) {
        gameState = "battle";
        let factForEnemy = collectedFacts.length > 0 ? collectedFacts.shift() : globalTopic;
        const questionObj = await generateQuestionFromGeminiFact(factForEnemy);
        const answer = prompt("Battle! Answer this question to win:\\n" + questionObj.question);
        if (answer && answer.toLowerCase() === questionObj.answer.toLowerCase()) {
          alert("Correct! Upgrading weapon.");
          player.weapon = "Upgraded";
          enemy.defeated = true;
          player.score += 20;
        } else {
          alert("Wrong answer. No upgrade.");
        }
        collectedQuestions.push(questionObj);
        gameState = "playing";
        updateHUD();
      }

      function startFinalQuiz() {
        let correct = 0;
        for (let q of collectedQuestions) {
          let userAnswer = prompt("Final Quiz: " + q.question);
          if (userAnswer && userAnswer.toLowerCase() === q.answer.toLowerCase()) {
            correct++;
          }
        }
        alert("Final Quiz complete! You answered " + correct + " out of " + collectedQuestions.length + " correctly.");
        gameState = "gameOver";
      }

      function updateHUD() {
        document.getElementById("score").textContent = player.score;
        document.getElementById("weapon").textContent = player.weapon;
      }

      function gameLoop(timestamp) {
        if (gameState === "playing" || gameState === "bossBattle") {
          drawMaze();
          drawBubbles();
          drawEnemies();
          drawBoss();
          drawPlayer();
          updatePlayerAnimation(timestamp);
        }
        if (gameState !== "gameOver") {
          requestAnimationFrame(gameLoop);
        }
      }

      function startGame() {
        globalTopic = document.getElementById("topicInput").value.trim();
        if (!globalTopic) {
          alert("Please enter a topic before starting the game.");
          return;
        }
        let infoPoints = parseInt(document.getElementById("infoPoints").value, 10);
        mazeCols = baseMazeSize + infoPoints;
        mazeRows = baseMazeSize + infoPoints;
        cellSize = Math.min(canvas.width / mazeCols, canvas.height / mazeRows);

        maze = generateMaze(mazeCols, mazeRows);

        player = { x: 0, y: 0, score: 0, weapon: "Basic" };
        collectedFacts = [];
        collectedQuestions = [];
        updateHUD();

        infoBubbles = [];
        let numBubbles = Math.floor(mazeCols * mazeRows * 0.1);
        for (let i = 0; i < numBubbles; i++) {
          let x = Math.floor(Math.random() * mazeCols);
          let y = Math.floor(Math.random() * mazeRows);
          infoBubbles.push({ x, y, topic: globalTopic, collected: false, fact: null });
        }

        enemies = [];
        let numEnemies = Math.floor(mazeCols * mazeRows * 0.05);
        for (let i = 0; i < numEnemies; i++) {
          let x = Math.floor(Math.random() * mazeCols);
          let y = Math.floor(Math.random() * mazeRows);
          if (x === 0 && y === 0) continue;
          enemies.push({ x, y, defeated: false });
        }

        boss = { x: mazeCols - 1, y: mazeRows - 1, defeated: false };

        gameState = "playing";
        requestAnimationFrame(gameLoop);
      }

      document.addEventListener("keydown", async function (e) {
        if (gameState !== "playing") return;
        let newX = player.x;
        let newY = player.y;
        if (e.key === "ArrowUp") newY--;
        if (e.key === "ArrowDown") newY++;
        if (e.key === "ArrowLeft") newX--;
        if (e.key === "ArrowRight") newX++;

        if (newX < 0 || newY < 0 || newX >= mazeCols || newY >= mazeRows) return;

        let currentCell = maze[player.y][player.x];
        if (newY < player.y && currentCell.walls[0]) return;
        if (newX > player.x && currentCell.walls[1]) return;
        if (newY > player.y && currentCell.walls[2]) return;
        if (newX < player.x && currentCell.walls[3]) return;

        player.x = newX;
        player.y = newY;
        await checkCollisions();
      });

      document.getElementById("startGame").addEventListener("click", startGame);
    `;
    document.body.appendChild(script);

    return () => {
      // Clean up the script when the component unmounts
      document.body.removeChild(script);
    };
  }, [topic]);

  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <h1>Procedural Maze Game with Gemini AI & Thicker Wall Lines</h1>
      <div id="topicInputContainer">
        <label htmlFor="topicInput">Enter Topic:</label>
        <input id="topicInput" type="text" placeholder="e.g., Space, History, Science" defaultValue={topic} />
      </div>
      <div id="settings">
        <label htmlFor="infoPoints">Info Points: </label>
        <input id="infoPoints" type="number" defaultValue="0" min="0" />
        <button id="startGame">Start Game</button>
      </div>
      <canvas id="gameCanvas" width="600" height="600"></canvas>
      <div id="hud">
        <span>Score: <span id="score" className="blue-text">0</span></span>
        <span style={{ marginLeft: "20px" }}>Weapon: <span id="weapon">Basic</span></span>
      </div>
    </div>
  );
}