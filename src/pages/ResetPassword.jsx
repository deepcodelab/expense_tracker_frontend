import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

const API = import.meta.env.VITE_BACKEND_API_URL;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const resetPassword = async () => {
    try {
      const res = await fetch(`${API}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          password: password,
        }),
      });

      if (!res.ok) {
        throw new Error("Reset failed");
      }

      setSuccess(true);
    } catch (err) {
      setError("Invalid or expired reset link");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 text-black">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Reset Password
        </h1>

        {!success ? (
          <div className="flex flex-col gap-4">
            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <input
              type="password"
              placeholder="Enter new password"
              className="rounded-md border px-3 py-2 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={resetPassword}
              disabled={!password}
              className="rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Reset Password
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-green-600 font-medium mb-4">
              Password updated successfully
            </p>

            <Link
              to="/login"
              className="text-blue-600 hover:underline"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}