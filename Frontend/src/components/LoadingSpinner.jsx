import React from "react";

const LoadingSpinner = ({
  size = "md",
  color = "primary",
  text = "",
  fullScreen = false,
  className = "",
  variant = "spinner", // New: spinner, pulse, dots, bars
}) => {
  // Size variants
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6 sm:w-8 sm:h-8",
    lg: "w-8 h-8 sm:w-12 sm:h-12",
    xl: "w-12 h-12 sm:w-16 sm:h-16",
  };

  // Color variants
  const colorClasses = {
    primary: "border-green-500",
    white: "border-white",
    gray: "border-gray-500",
    blue: "border-blue-500",
    green: "border-green-500",
    red: "border-red-500",
    yellow: "border-yellow-500",
    purple: "border-purple-500",
  };

  // Text size classes
  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-xs sm:text-sm",
    md: "text-sm sm:text-base",
    lg: "text-base sm:text-lg",
    xl: "text-lg sm:text-xl",
  };

  const spinnerClasses = `
    animate-spin 
    rounded-full 
    border-2 
    border-t-transparent 
    border-r-transparent
    ${sizeClasses[size]} 
    ${colorClasses[color]}
    ${className}
  `;

  const pulseClasses = `
    animate-pulse 
    rounded-full 
    ${sizeClasses[size]} 
    bg-current
    ${className}
  `;

  const containerClasses = fullScreen
    ? "fixed inset-0 flex flex-col justify-center items-center bg-black/60 backdrop-blur-sm z-50 p-4"
    : "flex flex-col justify-center items-center";

  // Spinner variants
  const renderSpinner = () => {
    switch (variant) {
      case "pulse":
        return (
          <div
            className={`${colorClasses[color].replace(
              "border-",
              "text-"
            )} opacity-75`}
          >
            <div className={pulseClasses}></div>
          </div>
        );

      case "dots":
        return (
          <div className="flex space-x-1 sm:space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${
                  sizeClasses[size]
                } bg-current rounded-full animate-bounce ${colorClasses[
                  color
                ].replace("border-", "text-")}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        );

      case "bars":
        return (
          <div className="flex space-x-1 items-end">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-1 sm:w-2 bg-current animate-pulse ${colorClasses[
                  color
                ].replace("border-", "text-")}`}
                style={{
                  height: `${12 + (i % 2) * 8}px`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: "1s",
                }}
              ></div>
            ))}
          </div>
        );

      default: // spinner
        return <div className={spinnerClasses}></div>;
    }
  };

  return (
    <div className={containerClasses}>
      <div className="relative">
        {renderSpinner()}

        {/* Glow effect for full screen */}
        {fullScreen && (
          <div className="absolute inset-0 animate-ping opacity-20">
            <div
              className={`${
                sizeClasses[size]
              } rounded-full bg-current ${colorClasses[color].replace(
                "border-",
                "text-"
              )}`}
            ></div>
          </div>
        )}
      </div>

      {text && (
        <p
          className={`mt-2 sm:mt-3 font-medium ${textSizeClasses[size]} ${
            color === "white"
              ? "text-white"
              : fullScreen
              ? "text-white"
              : "text-gray-600 dark:text-gray-300"
          } text-center max-w-xs sm:max-w-sm`}
        >
          {text}
        </p>
      )}
    </div>
  );
};

// Enhanced preset spinner variants for common use cases
export const PageSpinner = ({ text = "Loading...", variant = "spinner" }) => (
  <div className="flex items-center justify-center min-h-[200px] sm:min-h-[300px]">
    <LoadingSpinner
      size="lg"
      color="primary"
      text={text}
      variant={variant}
      className="mx-auto"
    />
  </div>
);

export const ButtonSpinner = ({ color = "white", size = "sm" }) => (
  <LoadingSpinner
    size={size}
    color={color}
    className="mr-2"
    variant="spinner"
  />
);

export const FullScreenSpinner = ({
  text = "Loading application...",
  variant = "spinner",
  showLogo = true,
}) => (
  <div className="fixed inset-0 bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] flex flex-col justify-center items-center z-50 p-4">
    {/* Animated Background */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>

    <div className="relative z-10 text-center">
      {showLogo && (
        <div className="mb-6 sm:mb-8">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 animate-bounce">
            🐍
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Snake Game
          </h1>
        </div>
      )}

      <LoadingSpinner size="xl" color="primary" text={text} variant={variant} />
    </div>
  </div>
);

export const InlineSpinner = ({
  size = "sm",
  color = "primary",
  variant = "spinner",
}) => (
  <LoadingSpinner
    size={size}
    color={color}
    variant={variant}
    className="inline-block"
  />
);

// Card loading skeleton
export const CardSkeleton = ({ className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-700/50 rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4">
      <div className="h-3 sm:h-4 bg-gray-600/50 rounded w-3/4"></div>
      <div className="space-y-2 sm:space-y-3">
        <div className="h-2 sm:h-3 bg-gray-600/50 rounded"></div>
        <div className="h-2 sm:h-3 bg-gray-600/50 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

// List loading skeleton
export const ListSkeleton = ({ items = 3, className = "" }) => (
  <div className={`space-y-3 sm:space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

// Enhanced loading overlay
export const LoadingOverlay = ({
  show = false,
  text = "Processing...",
  variant = "spinner",
  blur = true,
}) => {
  if (!show) return null;

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center z-40 ${
        blur ? "bg-black/60 backdrop-blur-sm" : "bg-black/40"
      } rounded-xl transition-all duration-300`}
    >
      <div className="bg-[#202c33]/90 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 sm:p-6 shadow-2xl">
        <LoadingSpinner
          size="lg"
          color="primary"
          text={text}
          variant={variant}
        />
      </div>
    </div>
  );
};

export default LoadingSpinner;
