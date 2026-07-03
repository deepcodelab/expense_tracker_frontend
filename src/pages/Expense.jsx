import { useState, useEffect, useContext, useCallback } from "react";
import Header from "../components/Header";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import { AuthContext } from "../context/AuthContext";
import FloatingAssistant from "../components/FloatingAssistant";

const API = import.meta.env.VITE_BACKEND_API_URL;

export default function ExpensePage() {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API}/categories`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setCategories(data.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      showToast("Failed to load categories", "error");
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API}/expenses`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
      showToast("Failed to load expenses", "error");
    }
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
      showToast("Expense added successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to add expense", "error");
    }
  };

  const handleExpenseDeleted = async (deletedExpenseId) => {
    setExpenses((prevExpenses) => 
      prevExpenses.filter((exp) => exp.id !== deletedExpenseId)
    );
    
    showToast("Expense deleted successfully!", "success");
  };

  const handleExpenseSavedFromChatbot = useCallback(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 text-black">
      <Header user={{ name: user?.email }} />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toast.type === "success" ? "✅" : "❌"}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 hover:opacity-75"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="w-full px-6 md:px-12 py-10 space-y-10">
        <ExpenseForm
          categories={categories}
          onSubmit={handleExpenseSubmit}
        />

        <ExpenseList
          expenses={expenses}
          categories={categories}
          onExpenseDeleted={handleExpenseDeleted}
        />
      </div>
      
      <FloatingAssistant onExpenseSaved={handleExpenseSavedFromChatbot} />
    </div>
  );
}