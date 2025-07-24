import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

// --- Constants ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const GRID_SIZE = 20;

const GamePage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

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

  // Game tracking variables
  const [gameStartTime, setGameStartTime] = useState(null);
  const [currentSnakeLength, setCurrentSnakeLength] = useState(3);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isSavingScore, setIsSavingScore] = useState(false);

  // --- Game Logic ---
  const resetGame = useCallback(() => {
    const initialSnake = [
      { x: GRID_SIZE * 10, y: GRID_SIZE * 10 },
      { x: GRID_SIZE * 9, y: GRID_SIZE * 10 },
      { x: GRID_SIZE * 8, y: GRID_SIZE * 10 },
    ];

    setSnake(initialSnake);
    setDirection("RIGHT");
    setSpeed(150);
    setScore(0);
    setPaused(false);
    setGameOver(false);
    setNewHighScore(false);
    setCurrentSnakeLength(3);
    setIsGameActive(true);
    setGameStartTime(Date.now());
    setIsSavingScore(false);
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

  // Save game score to backend
  const saveGameScore = async () => {
    if (!isAuthenticated || !gameStartTime || isSavingScore) return;

    setIsSavingScore(true);
    const playTime = Math.floor((Date.now() - gameStartTime) / 1000); // in seconds

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/save-game`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            score: score,
            snakeLength: currentSnakeLength,
            playTime: playTime,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Show achievement notifications
        if (data.newAchievements && data.newAchievements.length > 0) {
          // Show achievements one by one with delay
          data.newAchievements.forEach((achievement, index) => {
            setTimeout(() => {
              showNotification(
                "success",
                `🏆 Achievement Unlocked: ${achievement.name}! - ${achievement.description}`,
                6000
              );
            }, index * 2000);
          });
        }

        // Show score saved message
        if (isAuthenticated) {
          setTimeout(
            () => {
              showNotification(
                "info",
                `Game saved! Score: ${score}, Play time: ${Math.floor(
                  playTime / 60
                )}:${(playTime % 60).toString().padStart(2, "0")}`,
                4000
              );
            },
            data.newAchievements ? data.newAchievements.length * 2000 : 500
          );
        }
      }
    } catch (error) {
      console.error("Failed to save game:", error);
      if (isAuthenticated) {
        showNotification(
          "error",
          "Failed to save game score. Please check your connection."
        );
      }
    } finally {
      setIsSavingScore(false);
    }
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

  const handleGameOver = async () => {
    setGameOver(true);
    setIsGameActive(false);

    // Update high score
    if (score > highScore) {
      setNewHighScore(true);
      setHighScore(score);
      localStorage.setItem("snakeHighScore", score);
    }

    // Save game score to backend
    await saveGameScore();
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
          setCurrentSnakeLength(newSnake.length);
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
        W: "UP",
        ArrowDown: "DOWN",
        s: "DOWN",
        S: "DOWN",
        ArrowLeft: "LEFT",
        a: "LEFT",
        A: "LEFT",
        ArrowRight: "RIGHT",
        d: "RIGHT",
        D: "RIGHT",
      }[e.key];
      if (newDirection && !isGameOver) {
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
  }, [isGameOver]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const ControlButton = ({ dir, icon }) => (
    <button
      onTouchStart={(e) => {
        e.preventDefault();
        if (!isGameOver) setDirection(dir);
      }}
      onClick={() => !isGameOver && setDirection(dir)}
      disabled={isGameOver}
      className="control-btn w-16 h-16 bg-white/20 border-2 border-white/30 rounded-2xl text-white text-2xl flex items-center justify-center transition-transform active:scale-90 active:bg-white/40 md:hidden disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <i className={icon}></i>
    </button>
  );

  const formatPlayTime = () => {
    if (!gameStartTime) return "00:00";
    const playTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(playTime / 60);
    const seconds = playTime % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] text-white">
      <div className="w-full flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-4xl w-full">
          <div className="game-header flex flex-col md:flex-row justify-between items-center mb-8 p-4 rounded-2xl gap-4">
            <div className="flex gap-4 items-center">
              <button
                onClick={() => navigate("/")}
                className="back-btn flex items-center gap-2 py-2 px-4 rounded-full border-2 border-white/30 hover:bg-white/10 transition-transform hover:-translate-y-px"
              >
                <i className="ri-arrow-left-line"></i> Home
              </button>
              <button
                onClick={() => setPaused((p) => !p)}
                disabled={isGameOver}
                className={`pause-btn flex items-center gap-2 py-2 px-4 rounded-full border-2 transition-transform hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${
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

            <div className="flex gap-6 text-lg font-semibold">
              <span className="flex items-center gap-2">
                <i className="ri-trophy-line text-yellow-400"></i>
                Score: {score}
              </span>
              <span className="flex items-center gap-2">
                <i className="ri-star-line text-green-400"></i>
                Best: {highScore}
              </span>
              {isGameActive && (
                <span className="flex items-center gap-2">
                  <i className="ri-time-line text-blue-400"></i>
                  {formatPlayTime()}
                </span>
              )}
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
              <div className="game-over absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
                <div className="text-center p-8 bg-[#202c33] rounded-2xl border-2 border-white/20 shadow-2xl max-w-md w-full mx-4">
                  <h2 className="text-3xl font-bold mb-4 text-red-400">
                    Game Over!
                  </h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center p-3 bg-[#2a3942] rounded-lg">
                      <span className="text-gray-300">Final Score:</span>
                      <span className="text-xl font-bold text-yellow-400">
                        {score}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-[#2a3942] rounded-lg">
                      <span className="text-gray-300">Snake Length:</span>
                      <span className="text-xl font-bold text-green-400">
                        {currentSnakeLength}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-[#2a3942] rounded-lg">
                      <span className="text-gray-300">Play Time:</span>
                      <span className="text-xl font-bold text-blue-400">
                        {formatPlayTime()}
                      </span>
                    </div>

                    {isNewHighScore && (
                      <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg">
                        <p className="text-yellow-400 font-semibold animate-pulse">
                          🎉 New High Score! 🎉
                        </p>
                      </div>
                    )}

                    {!isAuthenticated && (
                      <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-300 text-sm">
                          💡 <strong>Sign up</strong> to save your scores and
                          unlock achievements!
                        </p>
                      </div>
                    )}

                    {isSavingScore && (
                      <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-400"></div>
                          <span className="text-green-300 text-sm">
                            Saving game...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={resetGame}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                    >
                      <i className="ri-refresh-line"></i> Play Again
                    </button>

                    {isAuthenticated ? (
                      <button
                        onClick={() => navigate("/profile")}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                      >
                        <i className="ri-user-line"></i> Profile
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate("/signup")}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                      >
                        <i className="ri-user-add-line"></i> Sign Up
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isPaused && !isGameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
                <div className="text-center p-6 bg-[#202c33] rounded-xl border border-white/20">
                  <h3 className="text-2xl font-bold mb-4">Game Paused</h3>
                  <p className="text-gray-300 mb-4">
                    Press SPACE or click Resume to continue
                  </p>
                  <button
                    onClick={() => setPaused(false)}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
                  >
                    <i className="ri-play-line mr-2"></i>Resume
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
            <p className="opacity-70 text-sm mt-4">
              Use buttons to control the snake
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
