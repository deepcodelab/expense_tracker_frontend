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

export default function App() {
  const isAuthenticated = !!localStorage.getItem("token");
  // <Route path="/" element={<Navigate to="/login" />} />
  return (
    <Routes>
      
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
