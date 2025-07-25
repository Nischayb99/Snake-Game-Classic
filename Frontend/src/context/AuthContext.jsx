import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import { useNotification } from "./NotificationContext";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        // Quick check for cached user first (for faster loading)
        const cachedUser = sessionStorage.getItem("user");
        if (cachedUser) {
          try {
            const userData = JSON.parse(cachedUser);
            setUser(userData);
          } catch (e) {
            sessionStorage.removeItem("user");
          }
        }

        // Then verify with backend
        const { user } = await authService.getCurrentUser();
        setUser(user);

        // Cache user data
        if (user) {
          sessionStorage.setItem("user", JSON.stringify(user));
        } else {
          sessionStorage.removeItem("user");
        }
      } catch (error) {
        setUser(null);
        sessionStorage.removeItem("user");
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    checkUserLoggedIn();
  }, []);

  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.signup(userData);
      if (result.success) {
        setSignupSuccess(true);
        showNotification(
          "success",
          "Signup successful! Please check your email to verify your account."
        );
        return { success: true };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.login(credentials);
      if (result.user) {
        setUser(result.user);
        // Cache user data
        sessionStorage.setItem("user", JSON.stringify(result.user));
        showNotification("success", "Login successfully");
        navigate("/");
        return { success: true };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      // Clear cached data
      sessionStorage.removeItem("user");
      showNotification("success", "Logged out successfully");
      navigate("/");
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  // This function is used to update the user profile information
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const { user: updatedUser } = await authService.updateProfile(userData);
      setUser(updatedUser);
      // Update cached data
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    updateProfile,
    clearError,
    isAuthenticated: !!user,
    isInitialized,
    signupSuccess,
    setSignupSuccess,
  };

  // Remove the loading spinner from here - let App.jsx handle it
  // This allows splash screen to show first
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
