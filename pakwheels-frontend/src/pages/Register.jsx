import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import PasswordInput from "../components/PasswordInput";

function Register() {
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get("role") === "seller" ? "seller" : "buyer";
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: roleFromUrl });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-blue-400 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1 text-center text-gray-800">Create account</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Join PakWheels today</p>

        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}

        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400" required />

        <PasswordInput
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="new-password"
        />

        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400" />

        <select name="role" value={form.role} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>

        <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium">
          Register
        </button>

        <p className="text-sm text-center mt-5 text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 font-medium">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;