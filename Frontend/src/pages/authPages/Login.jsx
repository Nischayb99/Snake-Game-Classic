import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

const Login = () => {
  const { login, loading, error, clearError } = useAuth();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!formData.email || !formData.password) {
      showNotification("error", "Please fill in all fields.");
      return;
    }

    try {
      const result = await login(formData);

      if (result.success) {
        showNotification("success", "Login successful!");
        navigate("/");
      } else {
        showNotification(
          "error",
          result.error || "Login failed. Please try again."
        );
      }
    } catch (error) {
      showNotification(
        "error",
        error.message || "An unexpected error occurred. Please try again."
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332] pt-8 md:pt-0">
      <div className="w-full max-w-md bg-[#202c33] rounded-xl shadow-2xl p-8 border border-gray-700/50 mx-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-300">
            Enter your credentials to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-3 rounded-lg bg-[#2a3942] text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-4 py-3 rounded-lg bg-[#2a3942] text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold transition disabled:opacity-60 shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-gray-300">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-green-400 hover:text-green-300 font-semibold"
            >
              Sign Up
            </Link>
          </p>
          <p className="text-gray-300">
            <Link
              to="/forgot-password"
              className="text-green-400 hover:text-green-300 font-semibold"
            >
              Forgot Password?
            </Link>
          </p>
        </div>

        {/* Google Auth Section */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-600"></span>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#202c33] text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <a
              href={import.meta.env.VITE_GOOGLE_AUTH_URL}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg bg-white hover:bg-gray-50 text-gray-900 font-medium transition"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
