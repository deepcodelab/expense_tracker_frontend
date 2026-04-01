import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const API = import.meta.env.VITE_BACKEND_API_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        alert("Invalid credentials");
        return;
      }

      const data = await res.json();

      login(data.access_token);
      navigate("/expense");
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 text-black">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>

        <div className="flex flex-col gap-4">
          <input
            className="rounded-md border px-3 py-2 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="rounded-md border px-3 py-2 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 transition"
          >
            Login
          </button>

          <div className="flex justify-between text-sm">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>

            <Link
              to="/signup"
              className="text-blue-600 hover:underline"
            >
              Signup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
