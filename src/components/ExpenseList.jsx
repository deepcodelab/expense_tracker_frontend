import { useState } from "react";

export default function ExpenseList({ expenses, categories }) {

  const [open, setOpen] = useState(null);

  const grouped = categories.map((cat) => ({
    ...cat,
    expenses: expenses.filter((e) => e.category_id === cat.id),
  })).filter((cat) => cat.expenses.length > 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full">
      <h2 className="text-xl font-semibold mb-6">Expenses</h2>

      {grouped.map((cat) => (

        <div key={cat.id} className="border rounded-lg mb-4">

          {/* Accordion Header */}
          <button
            onClick={() => setOpen(open === cat.id ? null : cat.id)}
            className="w-full flex justify-between items-center p-4 text-left !bg-transparent border-none focus:outline-none hover:bg-gray-50"
          >
            <span className="font-medium">{cat.name}</span>
            <span>{open === cat.id ? "-" : "+"}</span>
          </button>

          {/* Accordion Content */}
          {open === cat.id && (

            <div className="p-4 space-y-3">

              {cat.expenses.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No expenses
                </p>
              ) : (
                cat.expenses.map((exp) => (

                  <div
                    key={exp.id}
                    className="flex justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{exp.name}</p>
                      <p className="text-sm text-gray-500">
                        {exp.date}
                      </p>
                    </div>

                    <p className="font-semibold">
                      ₹{exp.amount}
                    </p>
                  </div>

                ))
              )}

            </div>

          )}

        </div>

      ))}

    </div>
  );
}