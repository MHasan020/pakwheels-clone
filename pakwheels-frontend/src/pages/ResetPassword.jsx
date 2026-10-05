import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import PasswordInput from "../components/PasswordInput";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", { token, new_password: password });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-blue-400 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1 text-center text-gray-800">Reset password</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Choose a new password.</p>

        {!token && (
          <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            This reset link is not valid. Please request a new one.
          </p>
        )}
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}

        {message ? (
          <div>
            <p className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm">{message}</p>
            <Link
              to="/login"
              className="block w-full text-center bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Go to login
            </Link>
          </div>
        ) : (
          <>
            <PasswordInput
              name="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <PasswordInput
              name="confirm"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-60"
            >
              {loading ? "Saving..." : "Reset password"}
            </button>

            <p className="text-sm text-center mt-5 text-gray-600">
              <Link to="/forgot-password" className="text-blue-600 font-medium">Request a new link</Link>
            </p>
          </>
        )}
      </form>
    </div>
  );
}

export default ResetPassword;