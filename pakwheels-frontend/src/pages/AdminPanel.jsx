import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function AdminPanel() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [approved, setApproved] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    api.get("/admin/pending")
      .then((res) => setCars(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else if (err.response?.status === 403) {
          setError("Only admins can view this page.");
        } else {
          setError("Something went wrong, please try again.");
        }
      })
      .finally(() => setLoading(false));

    api.get("/admin/approved")
      .then((res) => setApproved(res.data))
      .catch(() => {});

    api.get("/admin/users")
      .then((res) => setUsers(res.data))
      .catch(() => {});
  }, [navigate]);

  const handleAction = async (car, action) => {
    try {
      await api.put(`/admin/cars/${car.id}/${action}`);
      setCars(cars.filter((c) => c.id !== car.id));
      if (action === "approve") {
        setApproved([car, ...approved]);
      }
    } catch {
      alert("Action failed");
    }
  };

  const handleRemove = async (car) => {
    if (!window.confirm(`Remove "${car.title}" from the website?`)) return;
    try {
      await api.put(`/admin/cars/${car.id}/reject`);
      setApproved(approved.filter((c) => c.id !== car.id));
    } catch {
      alert("Could not remove the ad");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Pending Ads</h1>

        {loading && <p>Loading...</p>}
        {error && <p className="bg-red-100 text-red-700 p-3 rounded">{error}</p>}

        {!loading && !error && cars.length === 0 && (
          <p className="text-gray-600">No pending ads.</p>
        )}

        <div className="space-y-4">
          {cars.map((car) => (
            <div key={car.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
              <div>
                <Link to={`/cars/${car.id}`} className="font-semibold hover:text-blue-600">
                  {car.title}
                </Link>
                <p className="text-blue-600 font-bold">Rs {Number(car.price).toLocaleString()}</p>
                <p className="text-sm text-gray-600">{car.year} • {car.mileage} km</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleAction(car, "approve")}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(car, "reject")}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        {!error && (
          <>
            <h2 className="text-2xl font-bold mt-10 mb-4">Approved Ads</h2>

            {approved.length === 0 && (
              <p className="text-gray-600">No approved ads.</p>
            )}

            <div className="space-y-4">
              {approved.map((car) => (
                <div key={car.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                  <div>
                    <Link to={`/cars/${car.id}`} className="font-semibold hover:text-blue-600">
                      {car.title}
                    </Link>
                    <p className="text-blue-600 font-bold">Rs {Number(car.price).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{car.year} • {car.mileage} km</p>
                  </div>
                  <button
                    onClick={() => handleRemove(car)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {!error && (
          <>
            <h2 className="text-2xl font-bold mt-10 mb-4">Users</h2>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="p-3">{u.name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.phone || "-"}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : u.role === "seller"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;