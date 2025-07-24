import { useState } from "react";
import { Link } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();

      if (data.success) {
        setSent(true);
        showNotification(
          "success",
          data.message || "Reset link sent to your email"
        );
      } else {
        showNotification("error", data.message || "Failed to send reset link");
      }
    } catch (error) {
      showNotification("error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332]">
      <div className="w-full max-w-md bg-[#202c33] p-8 rounded-xl shadow-2xl border border-gray-700/50">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            Forgot Password
          </h2>
          <p className="text-gray-300">
            {sent ? "Check your email" : "Enter your email to reset password"}
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-green-400 text-6xl mb-4">✓</div>
            <p className="text-gray-300">
              If that email exists in our system, a reset link has been sent.
            </p>
            <Link
              to="/login"
              className="inline-block w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg bg-[#2a3942] text-white border border-[#334155] focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold transition disabled:opacity-60"
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
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-green-400 hover:text-green-300 font-medium"
              >
                ← Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

