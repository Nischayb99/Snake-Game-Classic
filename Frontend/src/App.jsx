import React, { useState, useCallback, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useNotification } from "./context/NotificationContext";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Notification from "./components/Notification";
import LoadingSpinner, {
  PageSpinner,
  FullScreenSpinner,
} from "./components/LoadingSpinner";
import ErrorBoundary from "./components/ErrorBoundary";

// Pages - Lazy loaded for better performance
const HomePage = React.lazy(() => import("./pages/HomePage"));
const GamePage = React.lazy(() => import("./pages/GamePage"));
const AboutPage = React.lazy(() => import("./pages/AboutPage"));
const Leaderboard = React.lazy(() => import("./pages/Leaderboard"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Login = React.lazy(() => import("./pages/authPages/Login"));
const Signup = React.lazy(() => import("./pages/authPages/Signup"));
const Profile = React.lazy(() => import("./pages/authPages/Profile"));
const EditProfile = React.lazy(() => import("./pages/authPages/EditProfile"));
const VerifyEmail = React.lazy(() => import("./pages/authPages/VerifyEmail"));
const ForgotPassword = React.lazy(() =>
  import("./pages/authPages/ForgotPassword")
);
const ResetPassword = React.lazy(() =>
  import("./pages/authPages/ResetPassword")
);

// Loading Component
const PageLoader = () => <PageSpinner text="Loading page..." />;

// App Loading Component
const AppLoader = () => <FullScreenSpinner text="Loading application..." />;

function App() {
  const { loading, user, isAuthenticated } = useAuth();
  const { notification, clearNotification } = useNotification();

  // Show loading screen while auth is initializing
  if (loading) {
    return <AppLoader />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0b141a] flex flex-col">
        {/* Navigation */}
        <Navbar />

        {/* Notification System */}
        {notification && (
          <div className="fixed top-4 right-4 z-50">
            <Notification
              type={notification.type}
              message={notification.message}
              show={!!notification}
              onClose={clearNotification}
            />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-6">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/game" element={<GamePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/leaderboard" element={<Leaderboard />} />

              {/* Auth Routes - Redirect if already logged in */}
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/profile" replace />
                  ) : (
                    <Login />
                  )
                }
              />
              <Route
                path="/signup"
                element={
                  isAuthenticated ? (
                    <Navigate to="/profile" replace />
                  ) : (
                    <Signup />
                  )
                }
              />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route
                path="/forgot-password"
                element={
                  isAuthenticated ? (
                    <Navigate to="/profile" replace />
                  ) : (
                    <ForgotPassword />
                  )
                }
              />
              <Route
                path="/reset-password"
                element={
                  isAuthenticated ? (
                    <Navigate to="/profile" replace />
                  ) : (
                    <ResetPassword />
                  )
                }
              />

              {/* Protected Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-profile"
                element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                }
              />

              {/* Dashboard for authenticated users */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <div className="text-center text-white py-20">
                    <h1 className="text-6xl font-bold mb-4">404</h1>
                    <p className="text-xl mb-8">Page not found</p>
                    <button
                      onClick={() => window.history.back()}
                      className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg transition-colors"
                    >
                      Go Back
                    </button>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2024 Snake Game. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
