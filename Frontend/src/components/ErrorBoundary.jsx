import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] flex items-center justify-center px-3 sm:px-4 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="max-w-md sm:max-w-lg w-full text-center relative z-10">
            {/* Error Icon with Animation */}
            <div className="mb-6 sm:mb-8 relative">
              <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-red-500/30 backdrop-blur-sm animate-pulse">
                <svg
                  className="h-10 w-10 sm:h-12 sm:w-12 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              {/* Floating particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-red-400 rounded-full animate-float opacity-30"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 2}s`,
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            <div className="bg-[#202c33]/80 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5"></div>
              <div className="relative z-10">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                  Oops! Something went wrong
                </h1>

                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  We're sorry, but something unexpected happened. Please try
                  refreshing the page or go back to the homepage.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <button
                onClick={this.handleReload}
                className="group w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/25 hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10 flex items-center justify-center gap-2 text-sm sm:text-base">
                  <i className="ri-refresh-line group-hover:rotate-180 transition-transform duration-500"></i>
                  Refresh Page
                </span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="group w-full bg-gray-700/80 hover:bg-gray-600 text-white font-medium py-3 sm:py-4 px-6 rounded-xl transition-all duration-300 border border-gray-600/50 hover:border-gray-500 backdrop-blur-sm hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10 flex items-center justify-center gap-2 text-sm sm:text-base">
                  <i className="ri-home-line group-hover:scale-110 transition-transform duration-300"></i>
                  Go to Homepage
                </span>
              </button>
            </div>

            {/* Developer Mode - Show error details in development */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-left bg-[#202c33]/60 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
                <summary className="cursor-pointer text-red-400 hover:text-red-300 p-4 sm:p-6 font-medium transition-colors duration-300 border-b border-red-500/20 bg-red-500/5">
                  <i className="ri-bug-line mr-2"></i>
                  Show Error Details (Development Only)
                </summary>
                <div className="p-4 sm:p-6 space-y-4">
                  <div>
                    <h3 className="text-red-400 font-medium mb-2 text-sm sm:text-base flex items-center gap-2">
                      <i className="ri-error-warning-line"></i>
                      Error:
                    </h3>
                    <pre className="text-red-300 whitespace-pre-wrap text-xs sm:text-sm bg-black/20 p-3 rounded-lg border border-red-500/20 overflow-x-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-red-400 font-medium mb-2 text-sm sm:text-base flex items-center gap-2">
                      <i className="ri-file-list-line"></i>
                      Stack Trace:
                    </h3>
                    <pre className="text-gray-400 whitespace-pre-wrap text-xs bg-black/20 p-3 rounded-lg border border-gray-600/20 overflow-x-auto max-h-40 sm:max-h-60">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              </details>
            )}

            {/* Help Text */}
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-gray-500 text-xs sm:text-sm">
                If this problem persists, please contact support
              </p>
            </div>
          </div>

          <style>{`
            @keyframes float {
              0%,
              100% {
                transform: translateY(0px) rotate(0deg);
                opacity: 1;
              }
              50% {
                transform: translateY(-20px) rotate(180deg);
                opacity: 0.5;
              }
            }

            .animate-float {
              animation: float 3s ease-in-out infinite;
            }
          `}</style>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

// Functional component wrapper for easier usage
export const ErrorBoundaryWrapper = ({ children, fallback }) => {
  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
};

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, fallback) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Custom hook for error handling in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = () => setError(null);

  const handleError = React.useCallback((error) => {
    console.error("Error caught by useErrorHandler:", error);
    setError(error);
  }, []);

  // Throw error to be caught by ErrorBoundary
  if (error) {
    throw error;
  }

  return { handleError, resetError };
};

export default ErrorBoundary;
