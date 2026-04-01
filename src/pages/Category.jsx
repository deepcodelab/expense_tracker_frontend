import { useEffect, useState, useContext } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const API = import.meta.env.VITE_BACKEND_API_URL;

export default function Category() {
  const { user } = useContext(AuthContext);

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [expenseInput, setExpenseInput] = useState("");
  const [aiCategories, setAiCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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
    } catch {
      setError("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, type }),
      });

      if (!res.ok) throw new Error("Failed to create category");

      setName("");
      fetchCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!expenseInput.trim()) return;

    setAiLoading(true);
    try {
      const res = await fetch(`${API}/ai/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ expense_desc: expenseInput }),
      });

      const data = await res.json();
      const parsedCategories = data.response
        .split(",")
        .map((item) => item.trim());

      setAiCategories(parsedCategories || []);
      setStep(2);
    } catch {
      setError("Failed to fetch AI categories");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectCategory = () => {
    setName(selectedCategory);
    setShowModal(false);

    setStep(1);
    setExpenseInput("");
    setSelectedCategory("");
    setAiCategories([]);
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 text-black">
      <Header user={{ name: user?.email }} />

      <div className="w-full px-6 md:px-12 py-10">
        <h2 className="text-3xl font-bold mb-6">
          Create Category
        </h2>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="mb-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          AI Help
        </button>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-4 gap-6 items-end mb-14"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border px-4 py-2 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border px-4 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <button
            disabled={loading}
            className={`h-[42px] rounded-lg text-white ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>

        {/* LIST */}
        <h3 className="text-xl font-semibold mb-6">
          Existing Categories
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.length === 0 ? (
            <div className="text-gray-500 text-sm">
              No categories yet
            </div>
          ) : (
            categories.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-lg border bg-white text-black"
              >
                <div className="flex justify-between">
                  <span className="font-semibold">{c.name}</span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      c.type === "expense"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {c.type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-black w-full max-w-md rounded-xl p-6">

            {step === 1 && (
              <>
                <h2 className="text-lg font-semibold mb-4">
                  Enter Expense
                </h2>

                <input
                  value={expenseInput}
                  onChange={(e) => setExpenseInput(e.target.value)}
                  className="w-full border px-3 py-2 mb-4 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Dinner at restaurant"
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-black rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSearch}
                    disabled={aiLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    {aiLoading ? "Searching..." : "Search"}
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-lg font-semibold mb-4">
                  Select Category
                </h2>

                <div className="space-y-2 mb-4">
                  {aiCategories.map((cat, i) => (
                    <label key={i} className="flex gap-2 items-center">
                      <input
                        type="radio"
                        value={cat}
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                      />
                      <span className="text-black">{cat}</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-gray-300 text-black rounded-lg"
                  >
                    Back
                  </button>

                  <button
                    disabled={!selectedCategory}
                    onClick={handleSelectCategory}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg"
                  >
                    Submit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
