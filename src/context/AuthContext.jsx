import { createContext, useEffect, useState } from "react";

const API = import.meta.env.VITE_BACKEND_API_URL;

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  const fetchUser = async (currentToken) => {
    try {
      const res = await fetch(`${API}/me`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch user");
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setUser(null);
    }
  }, [token]);

  // 🔥 central login handler
  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  // 🔥 logout handler (bonus)
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}