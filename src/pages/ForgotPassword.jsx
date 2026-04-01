import { useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_BACKEND_API_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const resetPassword = async () => {
    try {
      const res = await fetch(`${API}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Something went wrong");
        return;
      }

      setSent(true);
    } catch (err) {
      console.error("Reset error:", err);
      alert("Failed to send reset link");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 text-black">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Forgot Password
        </h1>

        {!sent ? (
          <div className="flex flex-col gap-4">
            <input
              className="rounded-md border px-3 py-2 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              onClick={resetPassword}
              disabled={!email}
              className="rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Send Reset Link
            </button>

            <Link
              to="/login"
              className="text-center text-sm text-blue-600 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <p className="text-center text-green-600 font-medium">
            Reset link sent to your email
          </p>
        )}
      </div>
    </div>
  );
}