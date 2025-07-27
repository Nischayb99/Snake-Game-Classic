import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const notificationId = useRef(0);
  const audioContextRef = useRef(null);

  // Load sound preference from localStorage
  useEffect(() => {
    const savedSoundSetting = localStorage.getItem("snake_game_sound_enabled");
    if (savedSoundSetting !== null) {
      setSoundEnabled(JSON.parse(savedSoundSetting));
    }
  }, []);

  // Save sound preference to localStorage
  useEffect(() => {
    localStorage.setItem(
      "snake_game_sound_enabled",
      JSON.stringify(soundEnabled)
    );
  }, [soundEnabled]);

  // Initialize AudioContext on first user interaction
  const initializeAudio = useCallback(() => {
    if (!audioInitialized && soundEnabled) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          audioContextRef.current = new AudioContext();
          setAudioInitialized(true);
        }
      } catch (error) {
        console.warn("AudioContext initialization failed:", error);
      }
    }
  }, [audioInitialized, soundEnabled]);

  // Set up user interaction listeners for audio initialization
  useEffect(() => {
    const handleUserInteraction = () => {
      initializeAudio();
      // Resume audio context if it's suspended
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume().catch(console.warn);
      }
    };

    // Listen for first user interaction
    const events = ["click", "touchstart", "keydown"];
    events.forEach((event) => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [initializeAudio]);

  // Enhanced notification types with icons and colors
  const notificationConfig = {
    success: {
      icon: "✅",
      color: "bg-green-500",
      borderColor: "border-green-400",
      textColor: "text-green-50",
      soundFreq: [523.25, 659.25, 783.99], // C5, E5, G5 (success chord)
    },
    error: {
      icon: "❌",
      color: "bg-red-500",
      borderColor: "border-red-400",
      textColor: "text-red-50",
      soundFreq: [220, 196], // A3, G3 (error sound)
    },
    warning: {
      icon: "⚠️",
      color: "bg-yellow-500",
      borderColor: "border-yellow-400",
      textColor: "text-yellow-50",
      soundFreq: [440, 349.23], // A4, F4 (warning sound)
    },
    info: {
      icon: "ℹ️",
      color: "bg-blue-500",
      borderColor: "border-blue-400",
      textColor: "text-blue-50",
      soundFreq: [440], // A4 (info sound)
    },
    achievement: {
      icon: "🏆",
      color: "bg-gradient-to-r from-yellow-500 to-orange-500",
      borderColor: "border-yellow-400",
      textColor: "text-yellow-50",
      soundFreq: [523.25, 659.25, 783.99, 1046.5], // C5, E5, G5, C6 (achievement fanfare)
    },
    power_up: {
      icon: "⚡",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      borderColor: "border-purple-400",
      textColor: "text-purple-50",
      soundFreq: [659.25, 783.99], // E5, G5 (power-up sound)
    },
    level_up: {
      icon: "🎯",
      color: "bg-gradient-to-r from-indigo-500 to-purple-500",
      borderColor: "border-indigo-400",
      textColor: "text-indigo-50",
      soundFreq: [523.25, 659.25, 783.99, 1046.5, 1318.5], // C5 to E6 (level up)
    },
    game_over: {
      icon: "💀",
      color: "bg-gradient-to-r from-gray-600 to-gray-800",
      borderColor: "border-gray-500",
      textColor: "text-gray-50",
      soundFreq: [220, 196, 174.61], // Descending notes (game over)
    },
  };

  // Play notification sound using Web Audio API - FIXED
  const playNotificationSound = useCallback(
    (type) => {
      if (!soundEnabled || !audioContextRef.current) return;

      try {
        const audioContext = audioContextRef.current;

        // Check if audio context is suspended and try to resume
        if (audioContext.state === "suspended") {
          audioContext.resume().catch(console.warn);
          return; // Don't play sound if context is suspended
        }

        if (audioContext.state !== "running") {
          return; // Don't play sound if context is not running
        }

        const config = notificationConfig[type] || notificationConfig.info;

        config.soundFreq.forEach((freq, index) => {
          try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            oscillator.type = type === "achievement" ? "triangle" : "sine";

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(
              0.1,
              audioContext.currentTime + 0.01
            );
            gainNode.gain.exponentialRampToValueAtTime(
              0.001,
              audioContext.currentTime + 0.3
            );

            const startTime = audioContext.currentTime + index * 0.1;
            const stopTime = audioContext.currentTime + 0.3 + index * 0.1;

            oscillator.start(startTime);
            oscillator.stop(stopTime);
          } catch (error) {
            console.warn("Failed to play individual sound note:", error);
          }
        });
      } catch (error) {
        console.warn("Could not play notification sound:", error);
      }
    },
    [soundEnabled]
  );

  // Enhanced show notification with priority and stacking
  const showNotification = useCallback(
    (type, message, duration = 5000, options = {}) => {
      const id = ++notificationId.current;
      const config = notificationConfig[type] || notificationConfig.info;

      const notification = {
        id,
        type,
        message,
        duration,
        timestamp: Date.now(),
        config,
        priority: options.priority || "normal", // 'low', 'normal', 'high', 'critical'
        persistent: options.persistent || false, // Don't auto-hide
        actions: options.actions || [], // Array of action buttons
        progress: options.progress, // Progress bar value (0-100)
        ...options,
      };

      // Handle priority system
      setNotifications((prev) => {
        let newNotifications = [...prev];

        // Remove old notifications if we have too many (max 5)
        if (newNotifications.length >= 5) {
          newNotifications = newNotifications.slice(-4);
        }

        // For critical notifications, clear all others
        if (notification.priority === "critical") {
          newNotifications = [];
        }

        return [...newNotifications, notification];
      });

      // Play sound only if audio is initialized
      if (audioInitialized && audioContextRef.current) {
        playNotificationSound(type);
      }

      // Auto-hide notification (unless persistent)
      if (!notification.persistent && duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    [playNotificationSound, audioInitialized]
  );

  // Remove specific notification
  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Update notification (useful for progress updates)
  const updateNotification = useCallback((id, updates) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, ...updates } : notification
      )
    );
  }, []);

  // Specialized notification methods for common game events
  const showAchievementNotification = useCallback(
    (achievementName, description) => {
      return showNotification(
        "achievement",
        `${achievementName}: ${description}`,
        8000,
        {
          priority: "high",
          actions: [
            {
              label: "View All",
              action: () => {
                // This would trigger navigation to achievements page
                window.dispatchEvent(
                  new CustomEvent("navigate-to-achievements")
                );
              },
            },
          ],
        }
      );
    },
    [showNotification]
  );

  const showPowerUpNotification = useCallback(
    (powerUpName, description) => {
      return showNotification(
        "power_up",
        `${powerUpName} activated! ${description}`,
        3000,
        {
          priority: "normal",
        }
      );
    },
    [showNotification]
  );

  const showLevelUpNotification = useCallback(
    (level) => {
      return showNotification(
        "level_up",
        `Level ${level} reached! Speed increased!`,
        4000,
        {
          priority: "high",
        }
      );
    },
    [showNotification]
  );

  const showGameOverNotification = useCallback(
    (score, isNewRecord = false) => {
      const message = isNewRecord
        ? `Game Over! New high score: ${score.toLocaleString()}!`
        : `Game Over! Final score: ${score.toLocaleString()}`;

      return showNotification("game_over", message, 6000, {
        priority: "high",
        actions: [
          {
            label: "Play Again",
            action: () => {
              window.dispatchEvent(new CustomEvent("restart-game"));
            },
          },
        ],
      });
    },
    [showNotification]
  );

  const showScoreMilestoneNotification = useCallback(
    (milestone) => {
      return showNotification(
        "success",
        `🎯 ${milestone} points milestone reached!`,
        5000,
        {
          priority: "high",
        }
      );
    },
    [showNotification]
  );

  const showProgressNotification = useCallback(
    (message, progress) => {
      return showNotification("info", message, 0, {
        persistent: true,
        progress,
        priority: "normal",
      });
    },
    [showNotification]
  );

  const showConnectionNotification = useCallback(
    (isOnline) => {
      const type = isOnline ? "success" : "warning";
      const message = isOnline
        ? "Connection restored!"
        : "Connection lost. Playing offline.";

      return showNotification(type, message, 3000, {
        priority: "high",
      });
    },
    [showNotification]
  );

  // Toggle sound on/off
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const newValue = !prev;
      if (newValue && !audioInitialized) {
        // Try to initialize audio when enabling sound
        initializeAudio();
      }
      return newValue;
    });
  }, [audioInitialized, initializeAudio]);

  // Get notification statistics
  const getNotificationStats = useCallback(() => {
    return {
      total: notifications.length,
      byType: notifications.reduce((acc, notif) => {
        acc[notif.type] = (acc[notif.type] || 0) + 1;
        return acc;
      }, {}),
      highPriority: notifications.filter(
        (n) => n.priority === "high" || n.priority === "critical"
      ).length,
      persistent: notifications.filter((n) => n.persistent).length,
    };
  }, [notifications]);

  const value = {
    // Core notification state
    notifications,
    soundEnabled,
    audioInitialized,

    // Basic notification methods
    showNotification,
    removeNotification,
    clearAllNotifications,
    updateNotification,

    // Specialized game notification methods
    showAchievementNotification,
    showPowerUpNotification,
    showLevelUpNotification,
    showGameOverNotification,
    showScoreMilestoneNotification,
    showProgressNotification,
    showConnectionNotification,

    // Settings and utilities
    toggleSound,
    getNotificationStats,
    initializeAudio,

    // Notification configuration
    notificationConfig,

    // Quick access methods for common patterns
    success: (message, duration, options) =>
      showNotification("success", message, duration, options),
    error: (message, duration, options) =>
      showNotification("error", message, duration, options),
    warning: (message, duration, options) =>
      showNotification("warning", message, duration, options),
    info: (message, duration, options) =>
      showNotification("info", message, duration, options),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Enhanced Notification Display Component */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
            onAction={(action) => {
              action.action();
              removeNotification(notification.id);
            }}
          />
        ))}
      </div>

      {/* Sound Toggle Button (fixed position) */}
      <button
        onClick={toggleSound}
        className="fixed bottom-4 right-4 z-40 w-12 h-12 bg-gray-800/80 hover:bg-gray-700/80 rounded-full flex items-center justify-center text-white border border-gray-600 backdrop-blur-sm transition-all duration-300 hover:scale-105"
        title={soundEnabled ? "Disable Sound" : "Enable Sound"}
      >
        <i
          className={`${
            soundEnabled ? "ri-volume-up-line" : "ri-volume-mute-line"
          } text-lg`}
        ></i>
        {/* Audio status indicator */}
        {soundEnabled && !audioInitialized && (
          <div
            className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"
            title="Click anywhere to enable audio"
          />
        )}
      </button>
    </NotificationContext.Provider>
  );
};

// Enhanced Notification Card Component - FIXED
const NotificationCard = ({ notification, onRemove, onAction }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Get soundEnabled from the notification context - FIX
  const { soundEnabled } = useNotification();

  useEffect(() => {
    // Entrance animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const handleAction = (action) => {
    onAction(action);
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${
          isVisible && !isLeaving
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }
        ${notification.config.color} ${notification.config.borderColor} ${
        notification.config.textColor
      }
        border-l-4 rounded-lg shadow-lg backdrop-blur-sm p-4 min-w-80 max-w-md
        hover:shadow-xl hover:scale-105
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 text-xl">{notification.config.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium leading-tight pr-2">
              {notification.message}
            </p>

            {/* Close button */}
            <button
              onClick={handleRemove}
              className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
            >
              <i className="ri-close-line text-sm"></i>
            </button>
          </div>

          {/* Progress bar */}
          {notification.progress !== undefined && (
            <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
              <div
                className="bg-white/80 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, notification.progress)
                  )}%`,
                }}
              ></div>
            </div>
          )}

          {/* Action buttons */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleAction(action)}
                  className="px-3 py-1 text-xs font-medium bg-white/20 hover:bg-white/30 rounded-md transition-colors duration-200"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Timestamp for debug/development */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-1 text-xs opacity-60">
              {new Date(notification.timestamp).toLocaleTimeString()}
              {soundEnabled !== undefined && !soundEnabled && (
                <span className="ml-2 text-yellow-300">[Sound disabled]</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationProvider;
