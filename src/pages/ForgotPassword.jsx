import { useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_BACKEND_API_URL;
// const API = "http://localhost:8000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const resetPassword = async () => {
    await fetch(`${API}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setSent(true);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Forgot Password
        </h1>

        {!sent ? (
          <div className="flex flex-col gap-4">
            <input
              className="rounded-md border px-3 py-2"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              onClick={resetPassword}
              disabled={!email}
              className="rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
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
