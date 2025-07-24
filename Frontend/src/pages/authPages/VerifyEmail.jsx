import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

const VerifyEmail = () => {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/verify-email?token=${token}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage("Email verified successfully! You can now log in.");
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    verifyEmail();
  }, [location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b141a] via-[#0f1922] to-[#1a2332]">
      <div className="w-full max-w-md bg-[#202c33] p-8 rounded-xl shadow-2xl border border-gray-700/50 text-center">
        {status === "loading" && (
          <div className="space-y-4">
            <div className="animate-spin mx-auto w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
            <div className="text-gray-300 text-lg">Verifying your email...</div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="text-green-400 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Email Verified!
            </h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition"
            >
              Continue to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Verification Failed
            </h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                to="/signup"
                className="inline-block w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition"
              >
                Create New Account
              </Link>
              <Link
                to="/login"
                className="inline-block w-full py-2 px-6 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-lg transition"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
