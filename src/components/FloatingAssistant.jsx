import { useState, useRef, useEffect } from "react";

const API = import.meta.env.VITE_BACKEND_API_URL;

// Expense Query Card Component
function ExpenseQueryCard({ summary, expenses, totalAmount, count }) {
  const [expanded, setExpanded] = useState(false);
  const INITIAL_DISPLAY = 5;
  
  const displayedExpenses = expanded ? expenses : expenses.slice(0, INITIAL_DISPLAY);
  const hasMore = expenses.length > INITIAL_DISPLAY;

  return (
    <div className="bg-white border rounded-2xl p-4 shadow">
      <div className="text-sm whitespace-pre-wrap mb-3">{summary}</div>
      
      {expanded && (
        <div className="space-y-2 mt-2">
          {displayedExpenses.map((exp, idx) => (
            <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-b-0">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{exp.name}</p>
                <p className="text-xs text-gray-500">{exp.display_date || exp.date}</p>
              </div>
              <p className="font-semibold text-sm ml-3 whitespace-nowrap">₹{exp.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
      
      {hasMore && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-900 transition"
          >
            {expanded ? "▲ Show Less" : `▼ Show All (${count} items)`}
          </button>
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-sm font-bold text-green-600">₹{totalAmount.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}


export default function FloatingAssistant({ onExpenseSaved }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi 👋 How can I help you?",
      type: "text",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);

  const token = localStorage.getItem("token");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isValidExpense = (expense) => {
    return (
      expense &&
      typeof expense.amount === "number" &&
      expense.amount > 0 &&
      typeof expense.category === "string" &&
      expense.category.trim() !== "" &&
      typeof expense.name === "string" &&
      expense.name.trim() !== ""
    );
  };

  // IMPROVED: Better detection of expense queries
  const isQueryMessage = (text) => {
    const textLower = text.toLowerCase();
    
    // Keywords that indicate the user is asking about expenses
    const queryPatterns = [
      "show", "list", "display", "get", "find", "search",
      "how much", "what are", "what is", "tell me", "what did",
      "expenses", "expense", "spending", "spent", "spend",
      "this month", "this week", "today", "yesterday", "last week", "last month"
    ];
    
    const hasQueryPattern = queryPatterns.some(pattern => textLower.includes(pattern));
    
    const hasExpenseContext = [
      "expense", "expenses", "spent", "spend", "spending",
      "shopping", "food", "transport", "bills", "entertainment",
      "bought", "paid", "purchased"
    ].some(word => textLower.includes(word));
    
    const isQuestion = textLower.includes("?") || 
                       textLower.startsWith("how") || 
                       textLower.startsWith("what") || 
                       textLower.startsWith("show") || 
                       textLower.startsWith("list");
    
    const result = hasQueryPattern || (hasExpenseContext && isQuestion);
    console.log(`isQueryMessage: "${text}" → ${result}`);  // Debug log
    return result;
  };

  const handleClearChat = async () => {
    try {
      const res = await fetch(`${API}/ai/clear-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setMessages([
          {
            role: "assistant",
            content: "Hi 👋 How can I help you? Chat history has been cleared.",
            type: "text",
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to clear chat:", err);
    }
  };

  const handleSaveExpense = async (expense, messageIndex, multiExpenseIndex = null) => {
    setActionInProgress(messageIndex);

    try {
      const res = await fetch(`${API}/expenses/save_ai_expense`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: expense.name,
          amount: expense.amount,
          category: expense.category,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to save expense");
      }

      const savedExpense = await res.json();

      setMessages((prev) =>
        prev.map((msg, idx) => {
          if (idx !== messageIndex) return msg;
          
          if (msg.type === "multi_expense" && multiExpenseIndex !== null) {
            const updatedExpenses = msg.expenses.map((exp, expIdx) =>
              expIdx === multiExpenseIndex
                ? { ...exp, status: "saved", id: savedExpense.id || savedExpense.expense_id }
                : exp
            );
            
            const allProcessed = updatedExpenses.every(
              exp => exp.status === "saved" || exp.status === "dismissed"
            );
            
            return {
              ...msg,
              expenses: updatedExpenses,
              type: allProcessed ? "multi_expense_completed" : "multi_expense",
            };
          }
          
          return {
            ...msg,
            type: "expense_saved",
            expense: {
              ...msg.expense,
              id: savedExpense.id || savedExpense.expense_id,
            },
          };
        })
      );

      if (onExpenseSaved) {
        onExpenseSaved();
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Failed to save expense. ${err.message}`,
          type: "text",
        },
      ]);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleSaveAllExpenses = async (expenses, messageIndex) => {
    for (let i = 0; i < expenses.length; i++) {
      const exp = expenses[i];
      if (exp.status !== "saved" && exp.status !== "dismissed") {
        await handleSaveExpense(exp, messageIndex, i);
      }
    }
  };

  const handleRemoveExpense = async (expenseId, messageIndex) => {
    if (!expenseId) {
      console.error("No expense ID provided");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    setRemovingId(expenseId);

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

      setMessages((prev) => prev.filter((_, idx) => idx !== messageIndex));

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "🗑️ Expense deleted successfully.",
          type: "text",
        },
      ]);

      if (onExpenseSaved) {
        onExpenseSaved();
      }
    } catch (err) {
      console.error("Delete error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Failed to delete expense. ${err.message}`,
          type: "text",
        },
      ]);
    } finally {
      setRemovingId(null);
    }
  };

  const handleDismissExpense = (messageIndex) => {
    setMessages((prev) =>
      prev.map((msg, idx) =>
        idx === messageIndex
          ? { ...msg, type: "expense_dismissed" }
          : msg
      )
    );

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Okay, expense not saved.",
        type: "text",
      },
    ]);
  };

  const handleDismissMultiExpense = (messageIndex, expenseIndex) => {
    setMessages((prev) =>
      prev.map((msg, idx) => {
        if (idx !== messageIndex) return msg;
        
        const updatedExpenses = msg.expenses.map((exp, expIdx) =>
          expIdx === expenseIndex
            ? { ...exp, status: "dismissed" }
            : exp
        );
        
        const allProcessed = updatedExpenses.every(
          exp => exp.status === "saved" || exp.status === "dismissed"
        );
        
        return {
          ...msg,
          expenses: updatedExpenses,
          type: allProcessed ? "multi_expense_completed" : "multi_expense",
        };
      })
    );
  };

  // Replace the entire handleSend with this simplified version:

  const handleSend = async () => {
    if (!input.trim()) return;

    const currentInput = input;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: currentInput,
        type: "text",
      },
    ]);

    setInput("");

    try {
      setLoading(true);

      // Call the Orchestrator Agent - it handles EVERYTHING
      const res = await fetch(`${API}/agent/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          expense_desc: currentInput,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to process request");
      }

      const data = await res.json();
      console.log("Agent response:", data);

      // Check if there are expense results to display
      const expenseResult = data.results?.find(r => r.action === "query_expenses");
      const extractResult = data.results?.find(r => r.action === "extract_expense");

      if (expenseResult?.success && expenseResult.result.count > 0) {
        // Show expense query result card
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            type: "expense_query_result",
            summary: data.response,
            expenses: expenseResult.result.expenses,
            total_amount: expenseResult.result.total,
            count: expenseResult.result.count,
          },
        ]);
      } else if (extractResult?.success && extractResult.result.is_valid) {
        // Show expense confirmation card
        const expense = extractResult.result.extracted;
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            type: "expense_confirmation",
            expense: expense,
          },
        ]);
      } else {
        // Show text response
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            type: "text",
          },
        ]);
      }

    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Something went wrong. Please try again.",
          type: "text",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-black text-white w-14 h-14 rounded-full shadow-lg hover:scale-105 transition z-50"
      >
        💬
      </button>

      {/* Chat Box */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-[500px] bg-white rounded-2xl shadow-2xl border flex flex-col z-50">
          {/* Header */}
          <div className="bg-black text-white p-4 rounded-t-2xl font-semibold flex justify-between items-center">
            <span>AI Assistant</span>
            <button
              onClick={handleClearChat}
              className="text-xs bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-900 transition"
              title="Clear chat history"
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] ${msg.role === "user" ? "ml-auto" : ""}`}
              >
                {/* TEXT MESSAGE */}
                {msg.type === "text" && (
                  <div
                    className={`p-3 rounded-xl whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    {msg.content}
                  </div>
                )}

                {/* EXPENSE QUERY RESULT CARD */}
                {msg.type === "expense_query_result" && (
                  <ExpenseQueryCard
                    summary={msg.summary}
                    expenses={msg.expenses}
                    totalAmount={msg.total_amount}
                    count={msg.count}
                  />
                )}

                {/* SINGLE EXPENSE CONFIRMATION CARD */}
                {msg.type === "expense_confirmation" && (
                  <div className="bg-white border rounded-2xl p-4 shadow">
                    <div className="text-sm text-gray-500 mb-2">Expense detected</div>
                    <div className="space-y-2 text-sm">
                      <div><strong>Expense Name:</strong> {msg.expense.name}</div>
                      <div><strong>Category:</strong> {msg.expense.category}</div>
                      <div><strong>Amount:</strong> ₹{msg.expense.amount}</div>
                    </div>
                    <div className="mt-4 text-sm font-medium">Do we need to save this expense?</div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleSaveExpense(msg.expense, idx)}
                        disabled={actionInProgress === idx}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionInProgress === idx ? "Saving..." : "Yes"}
                      </button>
                      <button
                        onClick={() => handleDismissExpense(idx)}
                        disabled={actionInProgress === idx}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}

                {/* MULTI EXPENSE CARD */}
                {msg.type === "multi_expense" && (
                  <div className="bg-white border rounded-2xl p-4 shadow">
                    <div className="text-sm text-gray-500 mb-3">
                      📊 Found {msg.count} expenses (Total: ₹{msg.total_amount})
                    </div>
                    <div className="space-y-3">
                      {msg.expenses.map((exp, expIdx) => (
                        <div key={expIdx} className="border-b last:border-b-0 pb-3 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{exp.name}</p>
                              <p className="text-xs text-gray-500">{exp.category}</p>
                            </div>
                            <p className="font-semibold text-sm ml-3">₹{exp.amount}</p>
                          </div>
                          {exp.status === "pending" && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleSaveExpense(exp, idx, expIdx)}
                                disabled={actionInProgress === idx}
                                className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition disabled:opacity-50"
                              >
                                ✓ Save
                              </button>
                              <button
                                onClick={() => handleDismissMultiExpense(idx, expIdx)}
                                disabled={actionInProgress === idx}
                                className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400 transition disabled:opacity-50"
                              >
                                ✕ Skip
                              </button>
                            </div>
                          )}
                          {exp.status === "saved" && (
                            <span className="text-xs text-green-600 font-medium mt-1 block">✅ Saved</span>
                          )}
                          {exp.status === "dismissed" && (
                            <span className="text-xs text-gray-400 font-medium mt-1 block">Skipped</span>
                          )}
                        </div>
                      ))}
                    </div>
                    {msg.expenses.some(exp => exp.status === "pending") && (
                      <div className="mt-4 pt-3 border-t">
                        <button
                          onClick={() => handleSaveAllExpenses(msg.expenses, idx)}
                          disabled={actionInProgress === idx}
                          className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50"
                        >
                          Save All ({msg.expenses.filter(e => e.status === "pending").length} remaining)
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* COMPLETED MULTI EXPENSE CARD */}
                {msg.type === "multi_expense_completed" && (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow">
                    <div className="text-sm text-gray-500 mb-3">📊 {msg.count} expenses processed</div>
                    <div className="space-y-2">
                      {msg.expenses.map((exp, expIdx) => (
                        <div key={expIdx} className="flex justify-between items-center text-sm">
                          <span>{exp.name}</span>
                          <span className={exp.status === "saved" ? "text-green-600" : "text-gray-400"}>
                            {exp.status === "saved" ? "✅" : "✕"} ₹{exp.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t text-sm font-medium">
                      Total Saved: ₹{msg.expenses.filter(e => e.status === "saved").reduce((sum, e) => sum + e.amount, 0)}
                    </div>
                  </div>
                )}

                {/* EXPENSE SAVED CARD */}
                {msg.type === "expense_saved" && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 shadow relative">
                    <div className="text-sm text-green-600 mb-2 font-medium">✅ Expense Saved</div>
                    <div className="space-y-2 text-sm">
                      <div><strong>Expense Name:</strong> {msg.expense.name}</div>
                      <div><strong>Category:</strong> {msg.expense.category}</div>
                      <div><strong>Amount:</strong> ₹{msg.expense.amount}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveExpense(msg.expense.id, idx)}
                      disabled={removingId === msg.expense.id}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete expense"
                    >
                      {removingId === msg.expense.id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}

                {/* EXPENSE DISMISSED CARD */}
                {msg.type === "expense_dismissed" && (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow opacity-60">
                    <div className="text-sm text-gray-500 mb-2 font-medium">Not Saved</div>
                    <div className="space-y-2 text-sm">
                      <div><strong>Expense Name:</strong> {msg.expense.name}</div>
                      <div><strong>Category:</strong> {msg.expense.category}</div>
                      <div><strong>Amount:</strong> ₹{msg.expense.amount}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="bg-gray-200 text-black p-3 rounded-xl w-fit">Thinking...</div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Section */}
          <div className="p-3 border-t bg-white rounded-b-2xl">
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend();
                  }
                }}
                placeholder="Ask something..."
                className="flex-1 min-w-0 h-11 border border-gray-300 rounded-lg px-3 outline-none focus:ring-2 focus:ring-black focus:border-black transition"
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="h-11 shrink-0 px-4 bg-black text-white rounded-lg hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}