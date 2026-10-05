import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Favorites() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    api.get("/cars/my/favorites")
      .then((res) => setCars(res.data))
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">My Favorites</h1>

        {loading && <p>Loading...</p>}

        {!loading && cars.length === 0 && (
          <p className="text-gray-600">No favorites yet.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <Link
              to={`/cars/${car.id}`}
              key={car.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
            >
              <h2 className="font-semibold">{car.title}</h2>
              <p className="text-gray-600 text-sm">
                {car.year} • {car.mileage} km • {car.transmission}
              </p>
              <p className="text-blue-600 font-bold mt-2">
                Rs {Number(car.price).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Favorites;