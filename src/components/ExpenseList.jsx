import { useState } from "react";

const API = import.meta.env.VITE_BACKEND_API_URL;

export default function ExpenseList({ expenses, categories, onExpenseDeleted }) {

  const [open, setOpen] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("token");

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    setDeletingId(expenseId);

    try {
      const res = await fetch(`${API}/expenses/${expenseId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to delete expense");
      }

      if (onExpenseDeleted) {
        onExpenseDeleted(expenseId);
      }

    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete expense. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const grouped = categories.map((cat) => ({
    ...cat,
    expenses: expenses.filter((e) => e.category_id === cat.id),
  })).filter((cat) => cat.expenses.length > 0);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Expenses</h2>
        {expenses.length > 0 && (
          <p className="text-sm text-gray-600">
            Total: <span className="font-bold text-green-600">₹{totalExpenses.toLocaleString()}</span>
          </p>
        )}
      </div>

      {grouped.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-2">📊</p>
          <p className="text-gray-500">No expenses found</p>
          <p className="text-sm text-gray-400 mt-1">
            Add your first expense to get started!
          </p>
        </div>
      ) : (
        grouped.map((cat) => (

          <div key={cat.id} className="border border-gray-200 rounded-lg mb-4 last:mb-0 overflow-hidden">

            {/* Accordion Header */}
            <button
              onClick={() => setOpen(open === cat.id ? null : cat.id)}
              className="w-full flex justify-between items-center p-4 text-left !bg-transparent hover:bg-gray-50 border-none focus:outline-none transition"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-900">{cat.name}</span>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-medium">
                  {cat.expenses.length}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">
                  ₹{cat.expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
                </span>
                <span className="text-lg font-bold text-gray-500">
                  {open === cat.id ? "−" : "+"}
                </span>
              </div>
            </button>

            {/* Accordion Content */}
            {open === cat.id && (

              <div className="px-4 pb-4 space-y-3">

                {cat.expenses.map((exp) => (

                  <div
                    key={exp.id}
                    className="flex justify-between items-center border-b border-gray-200 pb-3 last:border-b-0 last:pb-0 pt-3 first:pt-0"
                  >
                    <div className="flex-1 pr-4">
                      <p className="font-medium text-gray-900">{exp.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(exp.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      {exp.description && (
                        <p className="text-xs text-gray-400 mt-1">
                          {exp.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-800 whitespace-nowrap">
                        ₹{exp.amount.toLocaleString()}
                      </p>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteExpense(exp.id);
                        }}
                        disabled={deletingId === exp.id}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete expense"
                      >
                        {deletingId === exp.id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                ))}

              </div>

            )}

          </div>

        ))
      )}

    </div>
  );
}