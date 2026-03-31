import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import Category from "./pages/Category";
import ProtectedRoute from "./components/ProtectedRoute";
import ResetPassword from "./pages/ResetPassword";
import { useEffect, useState } from "react";
import ExpensePage from "./pages/Expense";

// const API = "http://localhost:8000";
const API = import.meta.env.VITE_BACKEND_API_URL;

/* =======================
   User List Component
======================= */
function UserList({ users }) {
  return (
    <ul className="space-y-2 mt-4">
      {users.map((user) => (
        <li
          key={user.id}
          className="flex justify-between rounded-lg border p-3 text-sm"
        >
          <span className="font-medium">{user.name}</span>
          <span className="text-gray-500">{user.email}</span>
        </li>
      ))}
    </ul>
  );
}

/* =======================
   Add User Form
======================= */
function AddUserForm({ onAddUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onAddUser(name, email);
    setName("");
    setEmail("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex flex-col gap-3"
    >
      <input
        className="rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter user name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        type="submit"
        className="rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 transition"
      >
        Add User
      </button>
    </form>
  );
}


export default function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/"
        element={isAuthenticated ? <ExpensePage /> : <Navigate to="/login" />}
      />
      <Route path="/category" element={<ProtectedRoute><Category /></ProtectedRoute>} />
      <Route path="/expense" element={<ProtectedRoute><ExpensePage /></ProtectedRoute>} />
    </Routes>
  );
}
