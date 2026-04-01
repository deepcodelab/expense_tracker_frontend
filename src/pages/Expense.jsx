import { useState, useEffect, useContext } from "react";
import Header from "../components/Header";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import { AuthContext } from "../context/AuthContext";

const API = import.meta.env.VITE_BACKEND_API_URL;

export default function ExpensePage() {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch(`${API}/categories`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setCategories(data.data);
  };

  const fetchExpenses = async () => {
    const res = await fetch(`${API}/expenses`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setExpenses(data);
  };

  const handleExpenseSubmit = async (expenseData) => {
    try {
      const res = await fetch(`${API}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expenseData),
      });

      if (!res.ok) {
        throw new Error("Failed to create expense");
      }

      await fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 text-black">
      <Header user={{ name: user?.email }} />

      <div className="w-full px-6 md:px-12 py-10 space-y-10">
        <ExpenseForm
          categories={categories}
          onSubmit={handleExpenseSubmit}
        />

        <ExpenseList
          expenses={expenses}
          categories={categories}
        />
      </div>
    </div>
  );
}
