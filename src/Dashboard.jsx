import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
      <div className="rounded-xl bg-white p-6 shadow-lg text-center">
        <h2 className="mb-4 text-xl font-bold">Logged In</h2>
        <button
          onClick={logout}
          className="rounded-md bg-red-600 px-6 py-2 text-white hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}