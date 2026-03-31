import { useState } from "react";
import { Link } from "react-router-dom";

export default function ExpenseForm({ categories, onSubmit }) {
  const today = new Date().toISOString().split("T")[0];
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      name,
      amount: parseFloat(amount),
      category_id: categoryId,
      date,
      description,
    };

    onSubmit(data);

    setName("");
    setAmount("");
    setCategoryId("");
    setDate("");
    setDescription("");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full">
      <h2 className="text-xl font-semibold mb-6">Add Expense</h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Expense Name
          </label>
          <input
            type="text"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Dinner, Uber, etc"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            required
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="100"
          />
        </div>

        {/* Category */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">
              Category
            </label>

            <Link
              to="/category"
              className="text-xs text-blue-600 hover:underline"
            >
              + Add Category
            </Link>
          </div>

          <select
            value={categoryId}
            required
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date with datepicker */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            required
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Optional notes"
          />
        </div>

        {/* Submit */}
        <div className="md:col-span-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            Save Expense
          </button>
        </div>
      </form>
    </div>
  );
}