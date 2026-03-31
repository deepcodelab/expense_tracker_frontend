import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Header({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="w-full bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-12 py-4">
        
        {/* App Title */}
        
            <Link
              to="/expense"
              className="text-xs text-blue-600 hover:underline"
            ><h1>
              Expense Tracker</h1>
            </Link>          
        



        {/* Right Side */}
        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-600">
            Welcome, <span className="font-semibold">{user?.name}</span>
          </span>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>

      </div>
    </header>
  );
}