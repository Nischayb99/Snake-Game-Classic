import React, { useState, useEffect, useRef, useCallback } from "react";

// --- Constants ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const GRID_SIZE = 20;

const GamePage = ({ navigateTo }) => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([]);
  const [food, setFood] = useState({});
  const [direction, setDirection] = useState("RIGHT");
  const [speed, setSpeed] = useState(150);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem("snakeHighScore")) || 0
  );
  const [isPaused, setPaused] = useState(false);
  const [isGameOver, setGameOver] = useState(false);
  const [isNewHighScore, setNewHighScore] = useState(false);

  // --- Game Logic ---
  const resetGame = useCallback(() => {
    setSnake([
      { x: GRID_SIZE * 10, y: GRID_SIZE * 10 },
      { x: GRID_SIZE * 9, y: GRID_SIZE * 10 },
      { x: GRID_SIZE * 8, y: GRID_SIZE * 10 },
    ]);
    setDirection("RIGHT");
    setSpeed(150);
    setScore(0);
    setPaused(false);
    setGameOver(false);
    setNewHighScore(false);
  }, []);

  // Must be separate because it depends on the snake state
  useEffect(() => {
    if (snake.length > 0) {
      generateFood(snake);
    }
  }, [snake.length === 3]); // Run only on reset essentially

  const generateFood = (currentSnake) => {
    const maxX = CANVAS_WIDTH / GRID_SIZE;
    const maxY = CANVAS_HEIGHT / GRID_SIZE;
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * maxX) * GRID_SIZE,
        y: Math.floor(Math.random() * maxY) * GRID_SIZE,
      };
    } while (
      currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      )
    );
    setFood(newFood);
  };

  // --- Drawing Logic ---
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");

    // Background
    const bgGradient = ctx.createLinearGradient(
      0,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );
    bgGradient.addColorStop(0, "#1a1a2e");
    bgGradient.addColorStop(1, "#16213e");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Snake with details
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.fillStyle = isHead ? "#f59e0b" : "#10b981";
      ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);

      ctx.strokeStyle = isHead ? "#fff" : "#065f46";
      ctx.lineWidth = 2;
      ctx.strokeRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);

      // Draw eyes on head
      if (isHead) {
        ctx.fillStyle = "#000";
        const eyeSize = 3;
        const eyeOffset = 5;
        if (direction === "RIGHT") {
          ctx.fillRect(
            segment.x + GRID_SIZE - eyeOffset - 2,
            segment.y + 4,
            eyeSize,
            eyeSize
          );
          ctx.fillRect(
            segment.x + GRID_SIZE - eyeOffset - 2,
            segment.y + GRID_SIZE - 7,
            eyeSize,
            eyeSize
          );
        } else if (direction === "LEFT") {
          ctx.fillRect(segment.x + 2, segment.y + 4, eyeSize, eyeSize);
          ctx.fillRect(
            segment.x + 2,
            segment.y + GRID_SIZE - 7,
            eyeSize,
            eyeSize
          );
        } else if (direction === "UP") {
          ctx.fillRect(segment.x + 4, segment.y + 2, eyeSize, eyeSize);
          ctx.fillRect(
            segment.x + GRID_SIZE - 7,
            segment.y + 2,
            eyeSize,
            eyeSize
          );
        } else if (direction === "DOWN") {
          ctx.fillRect(
            segment.x + 4,
            segment.y + GRID_SIZE - eyeOffset - 2,
            eyeSize,
            eyeSize
          );
          ctx.fillRect(
            segment.x + GRID_SIZE - 7,
            segment.y + GRID_SIZE - eyeOffset - 2,
            eyeSize,
            eyeSize
          );
        }
      }
    });

    // Draw Food with details
    if (food.x !== undefined) {
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(
        food.x + GRID_SIZE / 2,
        food.y + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
      // Shine
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.beginPath();
      ctx.arc(
        food.x + GRID_SIZE / 2 - 3,
        food.y + GRID_SIZE / 2 - 3,
        3,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  }, [snake, food, direction]);

  const handleGameOver = () => {
    setGameOver(true);
    if (score > highScore) {
      setNewHighScore(true);
      setHighScore(score);
      localStorage.setItem("snakeHighScore", score);
    }
  };

  // Game Loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (isPaused || isGameOver) return;

      setSnake((prevSnake) => {
        if (prevSnake.length === 0) return [];
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };

        switch (direction) {
          case "UP":
            head.y -= GRID_SIZE;
            break;
          case "DOWN":
            head.y += GRID_SIZE;
            break;
          case "LEFT":
            head.x -= GRID_SIZE;
            break;
          case "RIGHT":
            head.x += GRID_SIZE;
            break;
        }

        if (
          head.x < 0 ||
          head.x >= CANVAS_WIDTH ||
          head.y < 0 ||
          head.y >= CANVAS_HEIGHT ||
          newSnake.some((s) => s.x === head.x && s.y === head.y)
        ) {
          handleGameOver();
          return prevSnake;
        }

        newSnake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          if (newScore % 50 === 0) {
            setSpeed((s) => Math.max(60, s - 10));
          }
          generateFood(newSnake);
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, speed);

    return () => clearInterval(gameLoop);
  }, [isPaused, isGameOver, speed, direction, food, score]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      ) {
        e.preventDefault();
      }
      if (e.key === " ") setPaused((p) => !p);

      const newDirection = {
        ArrowUp: "UP",
        w: "UP",
        ArrowDown: "DOWN",
        s: "DOWN",
        ArrowLeft: "LEFT",
        a: "LEFT",
        ArrowRight: "RIGHT",
        d: "RIGHT",
      }[e.key];
      if (newDirection) {
        setDirection((d) =>
          ({ UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" }[d] !==
          newDirection
            ? newDirection
            : d)
        );
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const ControlButton = ({ dir, icon }) => (
    <button
      onTouchStart={(e) => {
        e.preventDefault();
        setDirection(dir);
      }}
      onClick={() => setDirection(dir)}
      className="control-btn w-16 h-16 bg-white/20 border-2 border-white/30 rounded-2xl text-white text-2xl flex items-center justify-center transition-transform active:scale-90 active:bg-white/40 md:hidden"
    >
      <i className={icon}></i>
    </button>
  );

  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-4xl w-full">
        <div className="game-header flex flex-col md:flex-row justify-between items-center mb-8 p-4 rounded-2xl gap-4">
          <div className="flex gap-4 items-center">
            <button
              onClick={() => navigateTo("home")}
              className="back-btn flex items-center gap-2 py-2 px-4 rounded-full border-2 border-white/30 hover:bg-white/10 transition-transform hover:-translate-y-px"
            >
              <i className="ri-arrow-left-line"></i> Home
            </button>
            <button
              onClick={() => setPaused((p) => !p)}
              className={`pause-btn flex items-center gap-2 py-2 px-4 rounded-full border-2 transition-transform hover:-translate-y-px ${
                isPaused
                  ? "border-red-500/50 bg-red-500/30"
                  : "border-white/30 hover:bg-white/10"
              }`}
            >
              {isPaused ? (
                <>
                  <i className="ri-play-line"></i> Resume
                </>
              ) : (
                <>
                  <i className="ri-pause-line"></i> Pause
                </>
              )}
            </button>
          </div>
          <div className="flex gap-8 text-lg font-semibold">
            <span>Score: {score}</span>
            <span>Best: {highScore}</span>
          </div>
        </div>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full h-auto border-4 border-white/30 rounded-2xl shadow-2xl"
          />
          {isGameOver && (
            <div className="game-over absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8 rounded-2xl border-2 border-white/20">
                <h2 className="text-3xl font-bold mb-2 text-red-500">
                  Game Over!
                </h2>
                <p className="text-lg mb-2 opacity-90">Your Score: {score}</p>
                {isNewHighScore && (
                  <p className="text-emerald-400 font-semibold animate-bounce mb-4">
                    🎉 New High Score!
                  </p>
                )}
                <button
                  onClick={resetGame}
                  className="play-btn mt-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-6 rounded-full text-lg font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 shadow-play-btn hover:shadow-play-btn-hover hover:-translate-y-1"
                >
                  <i className="ri-refresh-line"></i> Play Again
                </button>
              </div>
            </div>
          )}
        </div>
        <p className="opacity-70 text-sm mt-4 text-center hidden md:block">
          Use arrow keys or WASD to control • SPACE to pause
        </p>
        <div className="mt-8 flex flex-col items-center gap-2 md:hidden">
          <ControlButton dir="UP" icon="ri-arrow-up-line" />
          <div className="flex gap-2">
            <ControlButton dir="LEFT" icon="ri-arrow-left-line" />
            <ControlButton dir="DOWN" icon="ri-arrow-down-line" />
            <ControlButton dir="RIGHT" icon="ri-arrow-right-line" />
          </div>
          <p className="opacity-70 text-sm mt-4">Use buttons to control</p>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
