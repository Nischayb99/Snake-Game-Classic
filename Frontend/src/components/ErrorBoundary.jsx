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
        <div className="min-h-screen bg-[#0b141a] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="mb-8">
              <svg
                className="mx-auto h-24 w-24 text-red-500"
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

            {/* Error Message */}
            <h1 className="text-3xl font-bold text-white mb-4">
              Oops! Something went wrong
            </h1>

            <p className="text-gray-300 mb-8">
              We're sorry, but something unexpected happened. Please try
              refreshing the page or go back to the homepage.
            </p>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={this.handleReload}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Refresh Page
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Go to Homepage
              </button>
            </div>

            {/* Developer Mode - Show error details in development */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-red-400 hover:text-red-300 mb-4">
                  Show Error Details (Development Only)
                </summary>
                <div className="bg-gray-900 p-4 rounded-lg text-sm">
                  <h3 className="text-red-400 font-medium mb-2">Error:</h3>
                  <pre className="text-red-300 whitespace-pre-wrap mb-4">
                    {this.state.error.toString()}
                  </pre>

                  <h3 className="text-red-400 font-medium mb-2">
                    Stack Trace:
                  </h3>
                  <pre className="text-gray-400 whitespace-pre-wrap text-xs">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
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
