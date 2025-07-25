import { useState, useEffect } from "react";

/**
 * Enhanced Notification component for displaying alerts
 * @param {Object} props - Component props
 * @param {string} props.type - Type of notification ('success', 'error', 'info', 'warning')
 * @param {string} props.message - Notification message
 * @param {boolean} props.show - Whether to show the notification
 * @param {Function} props.onClose - Function to call when notification is closed
 * @param {number} props.duration - Auto-close duration in ms (default: 4000)
 * @param {string} props.position - Position ('top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center')
 */
const Notification = ({
  type = "info",
  message,
  show = false,
  onClose,
  duration = 4000,
  position = "top-right",
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  // Show/hide notification on prop change
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);

      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  // Manual close with animation
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300); // Match animation duration
  };

  if (!isVisible || !message) return null;

  // Styles for different notification types
  const notificationStyles = {
    success: {
      bg: "bg-gradient-to-r from-green-500/20 to-emerald-500/20",
      border: "border-green-500/40",
      text: "text-green-100",
      icon: "text-green-400",
    },
    error: {
      bg: "bg-gradient-to-r from-red-500/20 to-rose-500/20",
      border: "border-red-500/40",
      text: "text-red-100",
      icon: "text-red-400",
    },
    info: {
      bg: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20",
      border: "border-blue-500/40",
      text: "text-blue-100",
      icon: "text-blue-400",
    },
    warning: {
      bg: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20",
      border: "border-yellow-500/40",
      text: "text-yellow-100",
      icon: "text-yellow-400",
    },
  };

  // Position classes
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 transform -translate-x-1/2",
  };

  // Enhanced icons with animations
  const icons = {
    success: (
      <div className="relative">
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <div className="absolute inset-0 animate-ping opacity-30">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
      </div>
    ),
    error: (
      <div className="relative">
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
    ),
    info: (
      <div className="relative">
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01"
          />
        </svg>
      </div>
    ),
    warning: (
      <div className="relative">
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
    ),
  };

  const currentStyle = notificationStyles[type] || notificationStyles.info;

  // Format long messages for mobile
  const formattedMessage =
    message.length > 100 ? `${message.substring(0, 97)}...` : message;

  return (
    <div
      className={`fixed ${
        positionClasses[position]
      } z-[9999] transition-all duration-300 ease-in-out ${
        isAnimating
          ? "opacity-100 transform translate-y-0 scale-100"
          : "opacity-0 transform translate-y-2 scale-95"
      }`}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`
          relative overflow-hidden
          ${currentStyle.bg} ${currentStyle.border} ${currentStyle.text}
          backdrop-blur-md border-2 rounded-xl shadow-2xl
          min-w-[280px] sm:min-w-[320px] max-w-[340px] sm:max-w-[400px]
          p-3 sm:p-4
          hover:scale-105 transition-transform duration-200
        `}
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/0 pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10 flex items-start gap-3">
          {/* Icon */}
          <div className={`${currentStyle.icon} flex-shrink-0 mt-0.5`}>
            {icons[type] || icons.info}
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base capitalize">
                  {type === "success" && "✓ Success"}
                  {type === "error" && "✗ Error"}
                  {type === "info" && "ℹ Info"}
                  {type === "warning" && "⚠ Warning"}
                </p>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed break-words">
                  <span className="hidden sm:inline">{message}</span>
                  <span className="sm:hidden">{formattedMessage}</span>
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="flex-shrink-0 text-current hover:bg-white/10 rounded-full p-1 transition-colors duration-200 group"
                aria-label="Close notification"
              >
                <svg
                  className="w-4 h-4 group-hover:scale-110 transition-transform duration-200"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Progress bar for auto-close */}
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-current opacity-40 rounded-full transition-transform duration-75 ease-linear origin-left"
                style={{
                  transform: `scaleX(${isAnimating ? "0" : "1"})`,
                  transitionDuration: `${duration}ms`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
      </div>
    </div>
  );
};

// Toast container for managing multiple notifications
export const NotificationContainer = ({ notifications = [], onRemove }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {notifications.map((notification, index) => (
        <div
          key={notification.id || index}
          style={{
            top: `${16 + index * 80}px`,
            right: "16px",
          }}
          className="absolute pointer-events-auto"
        >
          <Notification
            {...notification}
            show={true}
            onClose={() => onRemove && onRemove(notification.id || index)}
          />
        </div>
      ))}
    </div>
  );
};

// Enhanced notification hook
export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, message, options = {}) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      type,
      message,
      duration: 4000,
      position: "top-right",
      ...options,
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto remove
    setTimeout(() => {
      removeNotification(id);
    }, notification.duration);

    return id;
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success: (message, options) => addNotification("success", message, options),
    error: (message, options) => addNotification("error", message, options),
    info: (message, options) => addNotification("info", message, options),
    warning: (message, options) => addNotification("warning", message, options),
  };
};

export default Notification;
