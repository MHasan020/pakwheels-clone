import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import PasswordInput from "../components/PasswordInput";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-blue-400 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1 text-center text-gray-800">Welcome back</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Login to your account</p>

        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <PasswordInput
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <div className="text-left -mt-2 mb-4">
          <Link to="/forgot-password" className="text-sm text-blue-600 font-medium hover:underline">
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium">
          Login
        </button>

        <p className="text-sm text-center mt-5 text-gray-600">
          Don't have an account? <Link to="/welcome" className="text-blue-600 font-medium">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;