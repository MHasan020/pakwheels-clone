import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  sold: "bg-gray-200 text-gray-700",
  rejected: "bg-red-100 text-red-800",
};

function MyAds() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    api.get("/cars/my/ads")
      .then((res) => setCars(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ad?")) return;
    try {
      await api.delete(`/cars/${id}`);
      setCars(cars.filter((c) => c.id !== id));
    } catch {
      alert("Could not delete the ad");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">My Ads</h1>

        {loading && <p>Loading...</p>}

        {!loading && cars.length === 0 && (
          <p className="text-gray-600">
            You don't have any ads yet.{" "}
            <Link to="/post-ad" className="text-blue-600">Post your first ad</Link>
          </p>
        )}

        <div className="space-y-4">
          {cars.map((car) => (
            <div key={car.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
              <div>
                <Link to={`/cars/${car.id}`} className="font-semibold hover:text-blue-600">
                  {car.title}
                </Link>
                <p className="text-blue-600 font-bold">Rs {Number(car.price).toLocaleString()}</p>
                <span className={`inline-block text-xs px-2 py-1 rounded mt-1 ${statusStyles[car.status]}`}>
                  {car.status}
                </span>
              </div>
              <div className="space-x-3">
                <Link to={`/edit-ad/${car.id}`} className="text-blue-600 hover:underline text-sm">
                  Edit
                </Link>
                <button onClick={() => handleDelete(car.id)} className="text-red-600 hover:underline text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyAds;