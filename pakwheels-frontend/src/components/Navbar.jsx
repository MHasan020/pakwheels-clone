import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [role, setRole] = useState("");

  useEffect(() => {
    if (token) {
      api.get("/auth/me")
        .then((res) => setRole(res.data.role))
        .catch(() => setRole(""));
    }
  }, [token]);

  const isAdmin = role === "admin";
  const canSell = role === "seller" || role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-4 flex justify-between items-center flex-wrap shadow-md">
      <Link to="/" className="font-bold text-2xl tracking-tight">
        Pak<span className="text-yellow-300">Wheels</span>
      </Link>
      <div className="space-x-5 text-sm font-medium">
        {token ? (
          <>
            {canSell && <Link to="/post-ad" className="hover:text-yellow-300 transition">Post Ad</Link>}
            {canSell && <Link to="/my-ads" className="hover:text-yellow-300 transition">My Ads</Link>}
            <Link to="/favorites" className="hover:text-yellow-300 transition">Favorites</Link>
            <Link to="/messages" className="hover:text-yellow-300 transition">Messages</Link>
            {isAdmin && <Link to="/admin" className="hover:text-yellow-300 transition">Admin</Link>}
            <button onClick={handleLogout} className="bg-white/20 px-3 py-1 rounded hover:bg-white/30 transition">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-yellow-300 transition">Login</Link>
            <Link to="/welcome" className="bg-yellow-400 text-blue-900 px-4 py-1.5 rounded font-semibold hover:bg-yellow-300 transition">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;