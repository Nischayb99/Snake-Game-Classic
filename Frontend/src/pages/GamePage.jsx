import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { cacheManager } from "../utils/cacheManager";
import { gameAnalytics } from "../utils/gameAnalytics";
import { Helmet } from "react-helmet";

// Enhanced Game Configuration
const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 500,
  GRID_SIZE: 20,
  INITIAL_SPEED: 150,
  SPEED_INCREMENT: 15,
  MAX_SPEED: 60,
  POINTS_PER_FOOD: 10,
  SPEED_INCREASE_INTERVAL: 50,
  POWER_UP_SPAWN_CHANCE: 0.15,
  POWER_UP_DURATION: 5000,
  TARGET_FPS: 60,
};

// Responsive Canvas Settings
const RESPONSIVE_CANVAS = {
  mobile: { width: 350, height: 280, gridSize: 15 },
  tablet: { width: 600, height: 400, gridSize: 18 },
  desktop: { width: 800, height: 500, gridSize: 20 },
};

// Power-ups Configuration
const POWER_UPS = {
  SPEED_BOOST: {
    color: "#ffeb3b",
    effect: "speed",
    duration: 3000,
    icon: "⚡",
    points: 20,
    description: "Increases snake speed temporarily",
  },
  DOUBLE_POINTS: {
    color: "#ff9800",
    effect: "points",
    duration: 8000,
    icon: "💎",
    points: 15,
    description: "Doubles points for a limited time",
  },
  INVINCIBLE: {
    color: "#e91e63",
    effect: "collision",
    duration: 4000,
    icon: "🛡️",
    points: 25,
    description: "Temporary immunity to collisions",
  },
  EXTRA_LIFE: {
    color: "#4caf50",
    effect: "life",
    duration: 0,
    icon: "❤️",
    points: 30,
    description: "Grants an extra life",
  },
};

const GamePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const animationFrameRef = useRef(null);
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  // Game State
  const [snake, setSnake] = useState([]);
  const [food, setFood] = useState({});
  const [powerUp, setPowerUp] = useState(null);
  const [direction, setDirection] = useState("RIGHT");
  const [nextDirection, setNextDirection] = useState("RIGHT");
  const [speed, setSpeed] = useState(GAME_CONFIG.INITIAL_SPEED);
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [lives, setLives] = useState(1);
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem("snakeHighScore")) || 0
  );
  const [isPaused, setPaused] = useState(false);
  const [isGameOver, setGameOver] = useState(false);
  const [isNewHighScore, setNewHighScore] = useState(false);
  const [activePowerUps, setActivePowerUps] = useState([]);

  // Enhanced Game Tracking
  const [gameStartTime, setGameStartTime] = useState(null);
  const [currentSnakeLength, setCurrentSnakeLength] = useState(3);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [foodEaten, setFoodEaten] = useState(0);
  const [powerUpsCollected, setPowerUpsCollected] = useState(0);
  const [gameLevel, setGameLevel] = useState(1);

  // NEW: Game Start Animation State
  const [isStarting, setIsStarting] = useState(true);
  const [startCountdown, setStartCountdown] = useState(3);
  const [showStartAnimation, setShowStartAnimation] = useState(true);
  const [gameConfig, setGameConfig] = useState(null);

  // Device Detection and Canvas Setup
  const [deviceType, setDeviceType] = useState("desktop");
  const [canvasConfig, setCanvasConfig] = useState(RESPONSIVE_CANVAS.desktop);

  // Touch Controls
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [isInvincible, setIsInvincible] = useState(false);
  const [showPowerUpEffect, setShowPowerUpEffect] = useState(false);

  // Performance Monitoring
  const [fps, setFps] = useState(60);
  const [frameCount, setFrameCount] = useState(0);
  const fpsIntervalRef = useRef(null);

  // NEW: Game configuration from Lobby
  useEffect(() => {
    const config = location.state;
    if (config) {
      setGameConfig(config);
      console.log("Game started with config:", config);
    }
  }, [location.state]);

  // NEW: Start Animation Effect
  useEffect(() => {
    if (showStartAnimation) {
      const countdownInterval = setInterval(() => {
        setStartCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setShowStartAnimation(false);
            setIsStarting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [showStartAnimation]);

  // Device Detection
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(
          userAgent
        );

      if (isMobile || width < 768) {
        setDeviceType("mobile");
        setCanvasConfig(RESPONSIVE_CANVAS.mobile);
      } else if (width < 1024) {
        setDeviceType("tablet");
        setCanvasConfig(RESPONSIVE_CANVAS.tablet);
      } else {
        setDeviceType("desktop");
        setCanvasConfig(RESPONSIVE_CANVAS.desktop);
      }
    };

    detectDevice();
    window.addEventListener("resize", detectDevice);
    return () => window.removeEventListener("resize", detectDevice);
  }, []);

  // FPS Monitoring
  useEffect(() => {
    fpsIntervalRef.current = setInterval(() => {
      setFps(frameCount);
      setFrameCount(0);
    }, 1000);

    return () => {
      if (fpsIntervalRef.current) {
        clearInterval(fpsIntervalRef.current);
      }
    };
  }, [frameCount]);

  // Enhanced Touch Gesture Handler with better accuracy
  const handleTouchGesture = useCallback((startX, startY, endX, endY) => {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const minSwipeDistance = 30;
    const maxClickThreshold = 10;

    // If movement is too small, treat as tap (pause/resume)
    if (
      Math.abs(deltaX) < maxClickThreshold &&
      Math.abs(deltaY) < maxClickThreshold
    ) {
      return "TAP";
    }

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        return deltaX > 0 ? "RIGHT" : "LEFT";
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        return deltaY > 0 ? "DOWN" : "UP";
      }
    }
    return null;
  }, []);

  // Enhanced Direction Change with Buffer System
  const changeDirection = useCallback(
    (newDirection) => {
      if (!isGameActive || isGameOver || isPaused || isStarting) return;

      const oppositeDirections = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
      };

      // Prevent reverse direction
      if (oppositeDirections[direction] === newDirection && snake.length > 1) {
        return;
      }

      // Use buffer system for smoother controls
      setNextDirection(newDirection);
    },
    [direction, isGameActive, isGameOver, isPaused, snake.length, isStarting]
  );

  // Enhanced Food Generation with Better Positioning
  const generateFood = useCallback(
    (currentSnake) => {
      const maxX = Math.floor(canvasConfig.width / canvasConfig.gridSize);
      const maxY = Math.floor(canvasConfig.height / canvasConfig.gridSize);
      let newFood;
      let attempts = 0;
      const maxAttempts = 100;

      do {
        newFood = {
          x: Math.floor(Math.random() * maxX) * canvasConfig.gridSize,
          y: Math.floor(Math.random() * maxY) * canvasConfig.gridSize,
          type: Math.random() < 0.1 ? "golden" : "normal", // 10% chance for golden food
        };
        attempts++;
      } while (
        attempts < maxAttempts &&
        (currentSnake.some(
          (segment) => segment.x === newFood.x && segment.y === newFood.y
        ) ||
          (powerUp && powerUp.x === newFood.x && powerUp.y === newFood.y))
      );

      setFood(newFood);
    },
    [canvasConfig, powerUp]
  );

  // Enhanced Power-up Generation
  const generatePowerUp = useCallback(() => {
    if (Math.random() < GAME_CONFIG.POWER_UP_SPAWN_CHANCE) {
      const powerUpTypes = Object.keys(POWER_UPS);
      const randomType =
        powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      const maxX = Math.floor(canvasConfig.width / canvasConfig.gridSize);
      const maxY = Math.floor(canvasConfig.height / canvasConfig.gridSize);

      let newPowerUp;
      let attempts = 0;

      do {
        newPowerUp = {
          x: Math.floor(Math.random() * maxX) * canvasConfig.gridSize,
          y: Math.floor(Math.random() * maxY) * canvasConfig.gridSize,
          type: randomType,
          createdAt: Date.now(),
          ...POWER_UPS[randomType],
        };
        attempts++;
      } while (
        attempts < 50 &&
        (snake.some(
          (segment) => segment.x === newPowerUp.x && segment.y === newPowerUp.y
        ) ||
          (food.x === newPowerUp.x && food.y === newPowerUp.y))
      );

      setPowerUp(newPowerUp);

      // Auto-remove power-up after timeout
      setTimeout(() => {
        setPowerUp((prev) =>
          prev?.createdAt === newPowerUp.createdAt ? null : prev
        );
      }, 12000);
    }
  }, [canvasConfig, snake, food]);

  // Enhanced Power-up Effect System
  const applyPowerUpEffect = useCallback(
    (powerUpType) => {
      const powerUpConfig = POWER_UPS[powerUpType];
      const powerUpId = Date.now();

      // Visual effect
      setShowPowerUpEffect(true);
      setTimeout(() => setShowPowerUpEffect(false), 500);

      if (powerUpType === "EXTRA_LIFE") {
        setLives((prev) => prev + 1);
        showNotification("success", `${powerUpConfig.icon} Extra Life gained!`);
        return;
      }

      setActivePowerUps((prev) => [
        ...prev,
        {
          id: powerUpId,
          type: powerUpType,
          ...powerUpConfig,
          startTime: Date.now(),
        },
      ]);

      switch (powerUpType) {
        case "SPEED_BOOST":
          setSpeed((prev) => Math.max(GAME_CONFIG.MAX_SPEED, prev - 30));
          break;
        case "DOUBLE_POINTS":
          setMultiplier(2);
          break;
        case "INVINCIBLE":
          setIsInvincible(true);
          break;
      }

      // Remove effect after duration
      setTimeout(() => {
        setActivePowerUps((prev) => prev.filter((p) => p.id !== powerUpId));

        switch (powerUpType) {
          case "SPEED_BOOST":
            setSpeed(
              GAME_CONFIG.INITIAL_SPEED +
                Math.floor(score / GAME_CONFIG.SPEED_INCREASE_INTERVAL) *
                  GAME_CONFIG.SPEED_INCREMENT
            );
            break;
          case "DOUBLE_POINTS":
            setMultiplier(1);
            break;
          case "INVINCIBLE":
            setIsInvincible(false);
            break;
        }
      }, powerUpConfig.duration);

      showNotification(
        "success",
        `${powerUpConfig.icon} ${powerUpConfig.description}!`
      );
    },
    [score, showNotification]
  );

  // Enhanced Game Reset
  const resetGame = useCallback(() => {
    // Clear any existing loops
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const initialSnake = Array.from({ length: 3 }, (_, i) => ({
      x: canvasConfig.gridSize * (10 - i),
      y: canvasConfig.gridSize * 10,
    }));

    setSnake(initialSnake);
    setDirection("RIGHT");
    setNextDirection("RIGHT");
    setSpeed(GAME_CONFIG.INITIAL_SPEED);
    setScore(0);
    setMultiplier(1);
    setLives(1);
    setPaused(false);
    setGameOver(false);
    setNewHighScore(false);
    setCurrentSnakeLength(3);
    setIsGameActive(false);
    setGameStartTime(null);
    setIsSavingScore(false);
    setMoveCount(0);
    setFoodEaten(0);
    setPowerUpsCollected(0);
    setGameLevel(1);
    setPowerUp(null);
    setActivePowerUps([]);
    setIsInvincible(false);
    setShowPowerUpEffect(false);
    setFrameCount(0);

    // Reset start animation
    setIsStarting(true);
    setStartCountdown(3);
    setShowStartAnimation(true);

    generateFood(initialSnake);
  }, [canvasConfig, generateFood]);

  // Start game after animation
  const startGameAfterAnimation = useCallback(() => {
    setIsGameActive(true);
    setGameStartTime(Date.now());

    // Track game start
    if (gameAnalytics?.trackGameStart) {
      gameAnalytics.trackGameStart({
        mode: gameConfig?.mode || "classic",
        difficulty: gameConfig?.difficulty || "normal",
        deviceType,
        ...canvasConfig,
      });
    }
  }, [gameConfig, deviceType, canvasConfig]);

  // Start game when countdown finishes
  useEffect(() => {
    if (!showStartAnimation && !isGameActive && !isGameOver) {
      startGameAfterAnimation();
    }
  }, [showStartAnimation, isGameActive, isGameOver, startGameAfterAnimation]);

  // Enhanced Collision Detection with Lives System
  const checkCollision = useCallback(
    (head, gameSnake) => {
      // Wall collision
      if (
        head.x < 0 ||
        head.x >= canvasConfig.width ||
        head.y < 0 ||
        head.y >= canvasConfig.height
      ) {
        return !isInvincible;
      }

      // Self collision (skip if invincible)
      if (!isInvincible) {
        for (let i = 1; i < gameSnake.length; i++) {
          if (head.x === gameSnake[i].x && head.y === gameSnake[i].y) {
            return true;
          }
        }
      }

      return false;
    },
    [canvasConfig, isInvincible]
  );

  // Enhanced Save Game Score
  const saveGameScore = async () => {
    if (!isAuthenticated || !gameStartTime || isSavingScore) return;

    setIsSavingScore(true);
    const playTime = Math.floor((Date.now() - gameStartTime) / 1000);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/save-game`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            score: score,
            snakeLength: currentSnakeLength,
            playTime: playTime,
            foodEaten: foodEaten,
            moveCount: moveCount,
            powerUpsUsed: powerUpsCollected,
            deviceType: deviceType,
            gameLevel: gameLevel,
            finalLives: lives,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        cacheManager.set("user_game_stats", data.gameStats, 300000);

        if (gameAnalytics?.trackGameEnd) {
          gameAnalytics.trackGameEnd({
            score,
            playTime,
            snakeLength: currentSnakeLength,
            deviceType,
            powerUpsUsed: powerUpsCollected,
            gameLevel,
          });
        }

        if (data.newAchievements?.length > 0) {
          data.newAchievements.forEach((achievement, index) => {
            setTimeout(() => {
              showNotification(
                "success",
                `🏆 Achievement: ${achievement.name}! - ${achievement.description}`,
                6000
              );
            }, index * 2000);
          });
        }

        setTimeout(
          () => {
            showNotification(
              "info",
              `Game saved! Score: ${score}, Time: ${Math.floor(
                playTime / 60
              )}:${(playTime % 60).toString().padStart(2, "0")}`,
              4000
            );
          },
          data.newAchievements ? data.newAchievements.length * 2000 : 500
        );
      }
    } catch (error) {
      console.error("Failed to save game:", error);
      showNotification("error", "Failed to save game score.");
    } finally {
      setIsSavingScore(false);
    }
  };

  // Enhanced Handle Game Over with Lives System
  const handleGameOver = useCallback(async () => {
    if (lives > 1 && !isGameOver) {
      // Use a life instead of ending game
      setLives((prev) => prev - 1);
      setIsInvincible(true);
      showNotification("warning", `💥 Life lost! ${lives - 1} lives remaining`);

      // Remove invincibility after 2 seconds
      setTimeout(() => {
        setIsInvincible(false);
      }, 2000);

      return;
    }

    // Clear game loop properly
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setGameOver(true);
    setIsGameActive(false);

    // Update high score
    if (score > highScore) {
      setNewHighScore(true);
      setHighScore(score);
      localStorage.setItem("snakeHighScore", score.toString());
    }

    // Save game score
    await saveGameScore();
  }, [lives, isGameOver, score, highScore, saveGameScore]);

  // Enhanced Game Loop with Performance Optimization and Bug Fixes
  const gameLoop = useCallback(
    (currentTime) => {
      if (isPaused || isGameOver || !isGameActive || isStarting) {
        if (isGameActive && !isPaused && !isGameOver && !isStarting) {
          gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return;
      }

      // FPS monitoring
      setFrameCount((prev) => prev + 1);

      // Throttle to target FPS
      if (
        currentTime - lastFrameTimeRef.current <
        1000 / GAME_CONFIG.TARGET_FPS
      ) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // Speed-based movement timing
      const speedInterval = speed;
      if (currentTime - lastFrameTimeRef.current < speedInterval) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      lastFrameTimeRef.current = currentTime;

      setSnake((prevSnake) => {
        if (prevSnake.length === 0) return [];

        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };

        // Update direction from buffer
        setDirection(nextDirection);

        // Move head based on direction
        switch (nextDirection) {
          case "UP":
            head.y -= canvasConfig.gridSize;
            break;
          case "DOWN":
            head.y += canvasConfig.gridSize;
            break;
          case "LEFT":
            head.x -= canvasConfig.gridSize;
            break;
          case "RIGHT":
            head.x += canvasConfig.gridSize;
            break;
        }

        // Check collision
        if (checkCollision(head, newSnake)) {
          handleGameOver();
          return prevSnake;
        }

        newSnake.unshift(head);
        setMoveCount((prev) => prev + 1);

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          const isGoldenFood = food.type === "golden";
          const basePoints = isGoldenFood
            ? GAME_CONFIG.POINTS_PER_FOOD * 2
            : GAME_CONFIG.POINTS_PER_FOOD;
          const points = basePoints * multiplier;

          setScore((prev) => prev + points);
          setCurrentSnakeLength(newSnake.length);
          setFoodEaten((prev) => prev + 1);

          if (isGoldenFood) {
            showNotification("success", "✨ Golden Food! Double points!");
          }

          // Level progression
          const newLevel = Math.floor((score + points) / 500) + 1;
          if (newLevel > gameLevel) {
            setGameLevel(newLevel);
            showNotification("info", `🎯 Level ${newLevel} reached!`);
          }

          // Increase speed periodically
          if ((score + points) % GAME_CONFIG.SPEED_INCREASE_INTERVAL === 0) {
            setSpeed((prev) =>
              Math.max(
                GAME_CONFIG.MAX_SPEED,
                prev - GAME_CONFIG.SPEED_INCREMENT
              )
            );
          }

          generateFood(newSnake);

          // Chance to generate power-up after eating food
          if (Math.random() < 0.3) {
            generatePowerUp();
          }
        } else {
          newSnake.pop();
        }

        // Check power-up collision
        if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
          setScore((prev) => prev + powerUp.points);
          setPowerUpsCollected((prev) => prev + 1);
          applyPowerUpEffect(powerUp.type);
          setPowerUp(null);
        }

        return newSnake;
      });

      // Continue game loop
      if (isGameActive && !isPaused && !isGameOver && !isStarting) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    },
    [
      isPaused,
      isGameOver,
      isGameActive,
      isStarting,
      speed,
      nextDirection,
      canvasConfig,
      checkCollision,
      handleGameOver,
      food,
      multiplier,
      score,
      gameLevel,
      generateFood,
      generatePowerUp,
      powerUp,
      applyPowerUpEffect,
    ]
  );

  // Start game loop
  useEffect(() => {
    if (!isPaused && !isGameOver && isGameActive && !isStarting) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameLoop, isPaused, isGameOver, isGameActive, isStarting]);

  // Enhanced Drawing Logic with Better Graphics
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvasConfig.width, canvasConfig.height);

    // Enhanced background with animated elements
    const bgGradient = ctx.createLinearGradient(
      0,
      0,
      canvasConfig.width,
      canvasConfig.height
    );
    bgGradient.addColorStop(0, "#1a1a2e");
    bgGradient.addColorStop(0.5, "#16213e");
    bgGradient.addColorStop(1, "#0f1419");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasConfig.width, canvasConfig.height);

    // NEW: Start Animation Overlay
    if (showStartAnimation) {
      // Dark overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, 0, canvasConfig.width, canvasConfig.height);

      // Countdown text
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${canvasConfig.gridSize * 3}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const centerX = canvasConfig.width / 2;
      const centerY = canvasConfig.height / 2;

      if (startCountdown > 0) {
        // Pulsing effect
        const scale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);

        // Glow effect
        ctx.shadowColor = "#00ff41";
        ctx.shadowBlur = 20;

        ctx.fillText(startCountdown.toString(), 0, 0);

        ctx.restore();
        ctx.shadowBlur = 0;

        // "Get Ready" text
        ctx.font = `${canvasConfig.gridSize}px Arial`;
        ctx.fillStyle = "#00ff41";
        ctx.fillText(
          "Get Ready!",
          centerX,
          centerY - canvasConfig.gridSize * 4
        );

        // Game mode info
        if (gameConfig) {
          ctx.font = `${canvasConfig.gridSize * 0.7}px Arial`;
          ctx.fillStyle = "#888";
          ctx.fillText(
            `${gameConfig.mode?.toUpperCase() || "CLASSIC"} MODE - ${
              gameConfig.difficulty?.toUpperCase() || "NORMAL"
            }`,
            centerX,
            centerY + canvasConfig.gridSize * 3
          );
        }
      }

      return; // Don't draw game elements during countdown
    }

    // Animated grid pattern
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    const time = Date.now() * 0.001;
    for (let x = 0; x <= canvasConfig.width; x += canvasConfig.gridSize) {
      const opacity = 0.03 + Math.sin(time + x * 0.01) * 0.02;
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasConfig.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvasConfig.height; y += canvasConfig.gridSize) {
      const opacity = 0.03 + Math.sin(time + y * 0.01) * 0.02;
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasConfig.width, y);
      ctx.stroke();
    }

    // Enhanced Snake Drawing with Glow Effect
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      const opacity = isInvincible ? 0.7 + Math.sin(time * 10) * 0.3 : 1;

      // Glow effect
      ctx.shadowColor = isHead ? "#f59e0b" : "#10b981";
      ctx.shadowBlur = isInvincible ? 20 : 10;

      // Snake segment gradient
      const segmentGradient = ctx.createRadialGradient(
        segment.x + canvasConfig.gridSize / 2,
        segment.y + canvasConfig.gridSize / 2,
        0,
        segment.x + canvasConfig.gridSize / 2,
        segment.y + canvasConfig.gridSize / 2,
        canvasConfig.gridSize / 2
      );

      if (isHead) {
        segmentGradient.addColorStop(0, `rgba(245, 158, 11, ${opacity})`);
        segmentGradient.addColorStop(1, `rgba(217, 119, 6, ${opacity})`);
      } else {
        const segmentOpacity = opacity * (0.9 - index * 0.02);
        segmentGradient.addColorStop(
          0,
          `rgba(16, 185, 129, ${segmentOpacity})`
        );
        segmentGradient.addColorStop(1, `rgba(5, 150, 105, ${segmentOpacity})`);
      }

      ctx.fillStyle = segmentGradient;
      ctx.fillRect(
        segment.x,
        segment.y,
        canvasConfig.gridSize,
        canvasConfig.gridSize
      );

      // Enhanced border
      ctx.shadowBlur = 0;
      ctx.strokeStyle = isHead
        ? "rgba(255, 255, 255, 0.8)"
        : "rgba(6, 95, 70, 0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        segment.x,
        segment.y,
        canvasConfig.gridSize,
        canvasConfig.gridSize
      );

      // Enhanced head details with directional eyes
      if (isHead) {
        ctx.fillStyle = "#000";
        const eyeSize = Math.max(2, canvasConfig.gridSize / 8);
        const eyeOffset = canvasConfig.gridSize / 4;

        // Direction-based eye positioning
        switch (direction) {
          case "RIGHT":
            ctx.fillRect(
              segment.x + canvasConfig.gridSize - eyeOffset,
              segment.y + eyeSize,
              eyeSize,
              eyeSize
            );
            ctx.fillRect(
              segment.x + canvasConfig.gridSize - eyeOffset,
              segment.y + canvasConfig.gridSize - eyeSize * 2,
              eyeSize,
              eyeSize
            );
            break;
          case "LEFT":
            ctx.fillRect(
              segment.x + eyeSize,
              segment.y + eyeSize,
              eyeSize,
              eyeSize
            );
            ctx.fillRect(
              segment.x + eyeSize,
              segment.y + canvasConfig.gridSize - eyeSize * 2,
              eyeSize,
              eyeSize
            );
            break;
          case "UP":
            ctx.fillRect(
              segment.x + eyeSize,
              segment.y + eyeSize,
              eyeSize,
              eyeSize
            );
            ctx.fillRect(
              segment.x + canvasConfig.gridSize - eyeSize * 2,
              segment.y + eyeSize,
              eyeSize,
              eyeSize
            );
            break;
          case "DOWN":
            ctx.fillRect(
              segment.x + eyeSize,
              segment.y + canvasConfig.gridSize - eyeOffset,
              eyeSize,
              eyeSize
            );
            ctx.fillRect(
              segment.x + canvasConfig.gridSize - eyeSize * 2,
              segment.y + canvasConfig.gridSize - eyeOffset,
              eyeSize,
              eyeSize
            );
            break;
        }
      }
    });

    // Enhanced Food Drawing with Animation
    if (food.x !== undefined) {
      const isGolden = food.type === "golden";
      const pulseScale = 1 + Math.sin(time * 8) * 0.1;
      const size = canvasConfig.gridSize * pulseScale;
      const offset = (canvasConfig.gridSize - size) / 2;

      ctx.shadowColor = isGolden ? "#ffd700" : "#ef4444";
      ctx.shadowBlur = isGolden ? 15 : 8;

      const foodGradient = ctx.createRadialGradient(
        food.x + canvasConfig.gridSize / 2,
        food.y + canvasConfig.gridSize / 2,
        0,
        food.x + canvasConfig.gridSize / 2,
        food.y + canvasConfig.gridSize / 2,
        size / 2
      );

      if (isGolden) {
        foodGradient.addColorStop(0, "#ffd700");
        foodGradient.addColorStop(0.7, "#ffb347");
        foodGradient.addColorStop(1, "#ff8c00");
      } else {
        foodGradient.addColorStop(0, "#ef4444");
        foodGradient.addColorStop(0.7, "#dc2626");
        foodGradient.addColorStop(1, "#b91c1c");
      }

      ctx.fillStyle = foodGradient;
      ctx.beginPath();
      ctx.arc(
        food.x + canvasConfig.gridSize / 2,
        food.y + canvasConfig.gridSize / 2,
        size / 2 - 2,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Food shine effect
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.beginPath();
      ctx.arc(
        food.x + canvasConfig.gridSize / 2 - 3,
        food.y + canvasConfig.gridSize / 2 - 3,
        3,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Golden food sparkle effect
      if (isGolden) {
        for (let i = 0; i < 4; i++) {
          const sparkleX =
            food.x +
            canvasConfig.gridSize / 2 +
            Math.cos(time * 4 + (i * Math.PI) / 2) *
              (canvasConfig.gridSize / 3);
          const sparkleY =
            food.y +
            canvasConfig.gridSize / 2 +
            Math.sin(time * 4 + (i * Math.PI) / 2) *
              (canvasConfig.gridSize / 3);

          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.beginPath();
          ctx.arc(sparkleX, sparkleY, 1, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

    // Enhanced Power-up Drawing with Pulsing Animation
    if (powerUp) {
      const pulseScale = 1 + Math.sin(time * 6) * 0.2;
      const size = canvasConfig.gridSize * pulseScale;
      const offset = (canvasConfig.gridSize - size) / 2;

      ctx.shadowColor = powerUp.color;
      ctx.shadowBlur = 20;

      const powerUpGradient = ctx.createRadialGradient(
        powerUp.x + canvasConfig.gridSize / 2,
        powerUp.y + canvasConfig.gridSize / 2,
        0,
        powerUp.x + canvasConfig.gridSize / 2,
        powerUp.y + canvasConfig.gridSize / 2,
        size / 2
      );
      powerUpGradient.addColorStop(0, powerUp.color);
      powerUpGradient.addColorStop(1, powerUp.color + "40");

      ctx.fillStyle = powerUpGradient;
      ctx.fillRect(powerUp.x + offset, powerUp.y + offset, size, size);

      // Power-up icon with glow
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#000";
      ctx.font = `bold ${canvasConfig.gridSize / 2}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText(
        powerUp.icon,
        powerUp.x + canvasConfig.gridSize / 2,
        powerUp.y + canvasConfig.gridSize / 1.5
      );

      // Rotating border effect
      ctx.strokeStyle = powerUp.color;
      ctx.lineWidth = 3;
      ctx.save();
      ctx.translate(
        powerUp.x + canvasConfig.gridSize / 2,
        powerUp.y + canvasConfig.gridSize / 2
      );
      ctx.rotate(time * 2);
      ctx.strokeRect(-size / 2, -size / 2, size, size);
      ctx.restore();
    }

    // Power-up collection effect
    if (showPowerUpEffect) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(0, 0, canvasConfig.width, canvasConfig.height);
    }

    // Reset shadow settings
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
  }, [
    snake,
    food,
    powerUp,
    direction,
    canvasConfig,
    isInvincible,
    showPowerUpEffect,
    showStartAnimation,
    startCountdown,
    gameConfig,
  ]);

  // Enhanced Keyboard Controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      ) {
        e.preventDefault();
      }

      if (e.key === " ") {
        if (isGameOver) {
          resetGame();
        } else if (!isStarting) {
          setPaused((p) => !p);
        }
        return;
      }

      // ESC to pause
      if (e.key === "Escape") {
        if (!isStarting && !isGameOver) {
          setPaused((p) => !p);
        }
        return;
      }

      const directionMap = {
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
      };

      const newDirection = directionMap[e.key];
      if (newDirection) {
        changeDirection(newDirection);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [changeDirection, isGameOver, resetGame, isStarting]);

  // Enhanced Touch Controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      setTouchStart({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const rect = canvas.getBoundingClientRect();
      const endX = touch.clientX - rect.left;
      const endY = touch.clientY - rect.top;

      const gestureResult = handleTouchGesture(
        touchStart.x,
        touchStart.y,
        endX,
        endY
      );

      if (gestureResult === "TAP") {
        if (isGameOver) {
          resetGame();
        } else if (!isStarting) {
          setPaused((p) => !p);
        }
      } else if (gestureResult) {
        changeDirection(gestureResult);
      }
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    touchStart,
    handleTouchGesture,
    changeDirection,
    isGameOver,
    resetGame,
    isStarting,
  ]);

  // Initialize game
  useEffect(() => {
    resetGame();

    // Cleanup on unmount
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Helper functions
  const formatPlayTime = () => {
    if (!gameStartTime) return "00:00";
    const playTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(playTime / 60);
    const seconds = playTime % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getEfficiencyScore = () => {
    if (moveCount === 0) return 0;
    return Math.round((score / moveCount) * 100) / 100;
  };

  const ControlButton = ({ dir, icon, className = "" }) => (
    <button
      onTouchStart={(e) => {
        e.preventDefault();
        if (!isGameOver && !isStarting) changeDirection(dir);
      }}
      onClick={() => !isGameOver && !isStarting && changeDirection(dir)}
      disabled={isGameOver || isStarting}
      className={`group control-btn bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 rounded-xl sm:rounded-2xl text-white flex items-center justify-center transition-all duration-300 active:scale-90 active:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm ${className}`}
    >
      <i
        className={`${icon} text-base sm:text-xl lg:text-2xl group-hover:scale-110 transition-transform duration-300`}
      ></i>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] text-white relative overflow-x-hidden">
      <Helmet>
        <title>Game | Snake Game Ultimate Edition</title>
        <meta
          name="description"
          content="Play Snake Game Ultimate Edition and enjoy the classic gameplay with modern features."
        />
      </Helmet>
      ;{/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-purple-500/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      <div className="w-full flex items-center justify-center p-3 sm:p-4 lg:p-8 relative z-10">
        <div className="max-w-5xl w-full">
          {/* Enhanced Game Header */}
          <div className="game-header flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 lg:mb-8 p-3 sm:p-4 rounded-xl lg:rounded-2xl gap-3 sm:gap-4 bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex gap-2 sm:gap-3 lg:gap-4 items-center w-full sm:w-auto justify-center sm:justify-start">
              <button
                onClick={() => navigate("/")}
                className="group back-btn flex items-center gap-1.5 sm:gap-2 py-2 px-3 sm:px-4 rounded-full border-2 border-white/30 hover:bg-white/10 transition-all duration-300 hover:-translate-y-px text-sm sm:text-base backdrop-blur-sm"
              >
                <i className="ri-arrow-left-line group-hover:scale-110 transition-transform duration-300"></i>
                <span className="hidden sm:inline">Home</span>
                <span className="sm:hidden">Back</span>
              </button>
              <button
                onClick={() => setPaused((p) => !p)}
                disabled={isGameOver || isStarting}
                className={`group pause-btn flex items-center gap-1.5 sm:gap-2 py-2 px-3 sm:px-4 rounded-full border-2 transition-all duration-300 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base backdrop-blur-sm ${
                  isPaused
                    ? "border-red-500/50 bg-red-500/20 hover:bg-red-500/30"
                    : "border-white/30 hover:bg-white/10"
                }`}
              >
                {isPaused ? (
                  <>
                    <i className="ri-play-line group-hover:scale-110 transition-transform duration-300"></i>
                    <span className="hidden sm:inline">Resume</span>
                    <span className="sm:hidden">Play</span>
                  </>
                ) : (
                  <>
                    <i className="ri-pause-line group-hover:scale-110 transition-transform duration-300"></i>
                    <span className="hidden sm:inline">Pause</span>
                    <span className="sm:hidden">Pause</span>
                  </>
                )}
              </button>
            </div>

            {/* Game Status Indicator */}
            {isStarting && (
              <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-full">
                <i className="ri-play-circle-line text-green-400 animate-pulse"></i>
                <span className="text-green-300 text-sm font-medium">
                  Starting...
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm lg:text-base font-semibold justify-center">
              <span className="flex items-center gap-1 sm:gap-1.5 bg-yellow-500/10 px-2 sm:px-3 py-1 rounded-full border border-yellow-500/20">
                <i className="ri-trophy-line text-yellow-400 text-sm"></i>
                <span className="hidden sm:inline">Score:</span>
                <span className="sm:hidden">S:</span>
                <span className="text-yellow-400">
                  {score.toLocaleString()}
                </span>
                {multiplier > 1 && (
                  <span className="text-orange-400 font-bold animate-pulse">
                    x{multiplier}
                  </span>
                )}
              </span>

              <span className="flex items-center gap-1 sm:gap-1.5 bg-green-500/10 px-2 sm:px-3 py-1 rounded-full border border-green-500/20">
                <i className="ri-star-line text-green-400 text-sm"></i>
                <span className="hidden sm:inline">Best:</span>
                <span className="sm:hidden">B:</span>
                <span className="text-green-400">
                  {highScore.toLocaleString()}
                </span>
              </span>

              <span className="flex items-center gap-1 sm:gap-1.5 bg-red-500/10 px-2 sm:px-3 py-1 rounded-full border border-red-500/20">
                <i className="ri-heart-line text-red-400 text-sm"></i>
                <span className="text-red-400">×{lives}</span>
              </span>

              <span className="flex items-center gap-1 sm:gap-1.5 bg-purple-500/10 px-2 sm:px-3 py-1 rounded-full border border-purple-500/20">
                <i className="ri-speed-line text-purple-400 text-sm"></i>
                <span className="hidden sm:inline">Lvl:</span>
                <span className="text-purple-400">{gameLevel}</span>
              </span>

              {isGameActive && !isStarting && (
                <span className="flex items-center gap-1 sm:gap-1.5 bg-blue-500/10 px-2 sm:px-3 py-1 rounded-full border border-blue-500/20">
                  <i className="ri-time-line text-blue-400 text-sm"></i>
                  <span className="text-blue-400">{formatPlayTime()}</span>
                </span>
              )}

              {activePowerUps.length > 0 && (
                <span className="flex items-center gap-1 sm:gap-1.5 bg-orange-500/10 px-2 sm:px-3 py-1 rounded-full border border-orange-500/20">
                  <i className="ri-flashlight-line text-orange-400 text-sm"></i>
                  <span className="text-orange-400">
                    {activePowerUps.length}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Active Power-ups Display */}
          {activePowerUps.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2 justify-center">
              {activePowerUps.map((powerUp) => {
                const timeLeft = Math.max(
                  0,
                  powerUp.duration - (Date.now() - powerUp.startTime)
                );
                const progress = (timeLeft / powerUp.duration) * 100;

                return (
                  <div
                    key={powerUp.id}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg px-3 py-1 text-sm backdrop-blur-sm"
                  >
                    <span className="text-lg animate-bounce">
                      {POWER_UPS[powerUp.type].icon}
                    </span>
                    <span className="text-purple-300 font-medium">
                      {powerUp.type.replace("_", " ")}
                    </span>
                    <div className="w-16 bg-purple-800/50 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-pink-400 h-1.5 rounded-full transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-purple-300">
                      {Math.ceil(timeLeft / 1000)}s
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Game Canvas Container */}
          <div className="relative mb-4 sm:mb-6">
            <canvas
              ref={canvasRef}
              width={canvasConfig.width}
              height={canvasConfig.height}
              className="w-full h-auto border-2 sm:border-4 border-white/30 rounded-xl sm:rounded-2xl shadow-2xl bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm"
              style={{ maxWidth: "100%", height: "auto" }}
            />

            {/* Game Over Modal */}
            {isGameOver && (
              <div className="game-over absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <div className="text-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#202c33]/95 to-[#1a2530]/95 backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 border-white/20 shadow-2xl max-w-sm sm:max-w-md w-full mx-2 sm:mx-4">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-red-400 animate-pulse">
                    Game Over!
                  </h2>

                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-[#2a3942] to-[#243339] rounded-lg border border-white/10">
                      <span className="text-gray-300 text-sm sm:text-base">
                        Final Score:
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-yellow-400">
                        {score.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-[#2a3942] to-[#243339] rounded-lg border border-white/10">
                      <span className="text-gray-300 text-sm sm:text-base">
                        Snake Length:
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-green-400">
                        {currentSnakeLength}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-[#2a3942] to-[#243339] rounded-lg border border-white/10">
                      <span className="text-gray-300 text-sm sm:text-base">
                        Play Time:
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-blue-400">
                        {formatPlayTime()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-[#2a3942] to-[#243339] rounded-lg border border-white/10">
                      <span className="text-gray-300 text-sm sm:text-base">
                        Level Reached:
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-purple-400">
                        {gameLevel}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-[#2a3942] to-[#243339] rounded-lg border border-white/10">
                      <span className="text-gray-300 text-sm sm:text-base">
                        Efficiency:
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-cyan-400">
                        {getEfficiencyScore()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-[#2a3942] to-[#243339] rounded-lg border border-white/10">
                      <span className="text-gray-300 text-sm sm:text-base">
                        Food Eaten:
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-orange-400">
                        {foodEaten}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-[#2a3942] to-[#243339] rounded-lg border border-white/10">
                      <span className="text-gray-300 text-sm sm:text-base">
                        Power-ups:
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-pink-400">
                        {powerUpsCollected}
                      </span>
                    </div>

                    {isNewHighScore && (
                      <div className="p-3 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border-2 border-yellow-500/50 rounded-lg animate-pulse">
                        <p className="text-yellow-400 font-bold text-sm sm:text-base">
                          🎉 NEW HIGH SCORE! 🎉
                        </p>
                        <p className="text-yellow-300 text-xs">
                          You've beaten your previous best!
                        </p>
                      </div>
                    )}

                    {!isAuthenticated && (
                      <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-300 text-xs sm:text-sm">
                          💡 <strong>Sign up</strong> to save scores, unlock
                          achievements, and compete on leaderboards!
                        </p>
                      </div>
                    )}

                    {isSavingScore && (
                      <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-400"></div>
                          <span className="text-green-300 text-xs sm:text-sm">
                            Saving game data...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={resetGame}
                      className="group flex-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white py-3 px-6 rounded-lg text-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:scale-105 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <i className="ri-refresh-line group-hover:rotate-180 transition-transform duration-300 relative z-10"></i>
                      <span className="relative z-10">Play Again</span>
                    </button>

                    {isAuthenticated ? (
                      <button
                        onClick={() => navigate("/profile")}
                        className="group flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600 text-white py-3 px-6 rounded-lg text-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:scale-105 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <i className="ri-user-line group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
                        <span className="relative z-10">View Profile</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate("/signup")}
                        className="group flex-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-lg text-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:scale-105 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <i className="ri-user-add-line group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
                        <span className="relative z-10">Join Now</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Pause Modal */}
            {isPaused && !isGameOver && !isStarting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <div className="text-center p-6 bg-gradient-to-br from-[#202c33]/95 to-[#1a2530]/95 backdrop-blur-sm rounded-xl border-2 border-white/20 shadow-2xl max-w-sm w-full mx-4">
                  <div className="mb-4">
                    <i className="ri-pause-circle-line text-6xl text-blue-400 animate-pulse"></i>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-blue-400">
                    Game Paused
                  </h3>

                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Current Score:</span>
                      <span className="text-yellow-400 font-bold">
                        {score.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Play Time:</span>
                      <span className="text-blue-400 font-bold">
                        {formatPlayTime()}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Level:</span>
                      <span className="text-purple-400 font-bold">
                        {gameLevel}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-6 text-sm">
                    Press{" "}
                    <kbd className="bg-white/20 px-2 py-1 rounded text-xs">
                      SPACE
                    </kbd>{" "}
                    or click Resume to continue
                  </p>

                  <button
                    onClick={() => setPaused(false)}
                    className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-8 rounded-lg font-bold transition-all duration-300 hover:scale-105 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <i className="ri-play-line mr-2 group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
                    <span className="relative z-10">Resume Game</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Controls Info */}
          <div className="opacity-70 text-xs sm:text-sm text-center hidden lg:block mb-4 space-y-1">
            <p>
              <kbd className="bg-white/20 px-2 py-1 rounded text-xs mx-1">
                ↑↓←→
              </kbd>{" "}
              or
              <kbd className="bg-white/20 px-2 py-1 rounded text-xs mx-1">
                WASD
              </kbd>{" "}
              to move •
              <kbd className="bg-white/20 px-2 py-1 rounded text-xs mx-1">
                SPACE
              </kbd>{" "}
              to pause •
              <kbd className="bg-white/20 px-2 py-1 rounded text-xs mx-1">
                ESC
              </kbd>{" "}
              to pause
            </p>
            <p>
              Collect <span className="text-yellow-300">✨ golden food</span>{" "}
              for double points • Power-ups:{" "}
              {Object.values(POWER_UPS)
                .map((p) => p.icon)
                .join(" ")}
            </p>
          </div>

          {/* Enhanced Mobile Controls */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 lg:hidden">
            <ControlButton
              dir="UP"
              icon="ri-arrow-up-line"
              className="w-14 h-14 sm:w-16 sm:h-16"
            />
            <div className="flex gap-3 sm:gap-4 items-center">
              <ControlButton
                dir="LEFT"
                icon="ri-arrow-left-line"
                className="w-14 h-14 sm:w-16 sm:h-16"
              />
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setPaused((p) => !p)}
                  disabled={isGameOver || isStarting}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 rounded-xl text-white flex items-center justify-center transition-all duration-300 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                >
                  {isPaused ? (
                    <i className="ri-play-line text-lg"></i>
                  ) : (
                    <i className="ri-pause-line text-lg"></i>
                  )}
                </button>
                <ControlButton
                  dir="DOWN"
                  icon="ri-arrow-down-line"
                  className="w-12 h-12 sm:w-14 sm:h-14"
                />
              </div>
              <ControlButton
                dir="RIGHT"
                icon="ri-arrow-right-line"
                className="w-14 h-14 sm:w-16 sm:h-16"
              />
            </div>

            <div className="text-center space-y-2">
              <p className="opacity-70 text-xs sm:text-sm">
                Tap buttons or swipe on game area • Tap center to pause
              </p>
              <p className="opacity-60 text-xs">
                Collect: <span className="text-yellow-300">✨</span> golden
                food,
                {Object.values(POWER_UPS).map((p, i) => (
                  <span key={i} className="mx-1" title={p.description}>
                    {p.icon}
                  </span>
                ))}{" "}
                power-ups
              </p>
            </div>
          </div>

          {/* Enhanced Game Stats Display */}
          {isGameActive && !isStarting && (
            <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <h3 className="text-lg font-bold text-center mb-4 text-white">
                Live Game Stats
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-3 border border-blue-500/30">
                  <div className="text-2xl font-bold text-blue-400">
                    {moveCount}
                  </div>
                  <div className="text-xs text-blue-300">Moves</div>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-3 border border-green-500/30">
                  <div className="text-2xl font-bold text-green-400">
                    {foodEaten}
                  </div>
                  <div className="text-xs text-green-300">Food Eaten</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-3 border border-purple-500/30">
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.round(
                      (GAME_CONFIG.INITIAL_SPEED - speed) /
                        GAME_CONFIG.SPEED_INCREMENT
                    ) + 1}
                  </div>
                  <div className="text-xs text-purple-300">Speed</div>
                </div>

                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg p-3 border border-orange-500/30">
                  <div className="text-2xl font-bold text-orange-400">
                    {getEfficiencyScore()}
                  </div>
                  <div className="text-xs text-orange-300">Efficiency</div>
                </div>
              </div>

              {/* Performance Stats for Developers */}
              {process.env.NODE_ENV === "development" && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-center gap-4 text-xs text-gray-400">
                    <span>FPS: {fps}</span>
                    <span>Device: {deviceType}</span>
                    <span>
                      Canvas: {canvasConfig.width}×{canvasConfig.height}
                    </span>
                  </div>
                </div>
              )}

              {/* Special Effects Indicators */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {isInvincible && (
                  <span className="bg-pink-500/20 border border-pink-500/30 px-3 py-1 rounded-full text-pink-300 animate-pulse text-sm">
                    🛡️ Invincible
                  </span>
                )}
                {multiplier > 1 && (
                  <span className="bg-orange-500/20 border border-orange-500/30 px-3 py-1 rounded-full text-orange-300 animate-pulse text-sm">
                    💎 {multiplier}x Points
                  </span>
                )}
                {lives > 1 && (
                  <span className="bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-full text-red-300 text-sm">
                    ❤️ Extra Lives: {lives - 1}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Game Tips for New Players */}
          {!isGameActive && !isGameOver && !isStarting && (
            <div className="mt-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-indigo-500/20 p-4">
              <h3 className="text-lg font-bold text-center mb-4 text-indigo-300">
                <i className="ri-lightbulb-line mr-2"></i>
                Pro Tips
              </h3>

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Power-ups:</h4>
                  <ul className="space-y-1 text-gray-300">
                    <li>⚡ Speed Boost - Move faster temporarily</li>
                    <li>💎 Double Points - 2x score for limited time</li>
                    <li>🛡️ Invincible - Pass through walls & yourself</li>
                    <li>❤️ Extra Life - Survive one collision</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Strategy:</h4>
                  <ul className="space-y-1 text-gray-300">
                    <li>🌟 Look for golden food (2x points)</li>
                    <li>🎯 Plan your path to avoid traps</li>
                    <li>🔄 Use edges to make tight turns</li>
                    <li>⏱️ Power-ups stack - collect multiple!</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Quick Access Actions */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {isAuthenticated && (
              <>
                <button
                  onClick={() => navigate("/leaderboard")}
                  className="group flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/30 text-yellow-300 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                >
                  <i className="ri-trophy-line group-hover:scale-110 transition-transform duration-300"></i>
                  <span className="text-sm font-medium">Leaderboard</span>
                </button>

                <button
                  onClick={() => navigate("/profile")}
                  className="group flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                >
                  <i className="ri-user-line group-hover:scale-110 transition-transform duration-300"></i>
                  <span className="text-sm font-medium">My Profile</span>
                </button>
              </>
            )}

            <button
              onClick={() => {
                if (
                  confirm("Start a new game? Current progress will be lost.")
                ) {
                  resetGame();
                }
              }}
              disabled={!isGameActive || isStarting}
              className="group flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 text-green-300 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="ri-refresh-line group-hover:rotate-180 transition-transform duration-300"></i>
              <span className="text-sm font-medium">New Game</span>
            </button>
          </div>

          {/* Footer Credits */}
          <div className="mt-8 text-center text-xs text-gray-500 space-y-1">
            <p>Enhanced Snake Game v2.0 • Built with React & HTML5 Canvas</p>
            <p>
              Features: Power-ups, Lives System, Golden Food, Level Progression
              {process.env.NODE_ENV === "development" && (
                <span className="ml-2 text-yellow-400">[DEV MODE]</span>
              )}
            </p>
            {gameConfig && (
              <p className="text-blue-400">
                Mode: {gameConfig.mode?.toUpperCase() || "CLASSIC"} •
                Difficulty: {gameConfig.difficulty?.toUpperCase() || "NORMAL"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
