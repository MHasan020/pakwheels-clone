import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

const emptyFilters = { q: "", brand_id: "", city_id: "", min_price: "", max_price: "" };

function Home() {
  const [cars, setCars] = useState([]);
  const [brands, setBrands] = useState([]);
  const [cities, setCities] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);
    const [photos, setPhotos] = useState({});

  useEffect(() => {
    api.get("/brands").then((res) => setBrands(res.data));
    api.get("/cities").then((res) => setCities(res.data));
  }, []);

    useEffect(() => {
    const params = {};
    Object.entries(applied).forEach(([key, value]) => {
      if (value !== "") params[key] = value;
    });
    api.get("/cars/", { params })
      .then((res) => {
        setCars(res.data);
        res.data.forEach((car) => {
          api.get(`/cars/${car.id}/images`)
            .then((imgRes) => {
              if (imgRes.data.length > 0) {
                setPhotos((prev) => ({ ...prev, [car.id]: imgRes.data[0].image_url }));
              }
            })
            .catch(() => {});
        });
      })
      .finally(() => setLoading(false));
  }, [applied]);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setApplied(filters);
  };

  const handleReset = () => {
    setLoading(true);
    setFilters(emptyFilters);
    setApplied(emptyFilters);
  };

  const inputClass = "border border-gray-300 rounded-lg p-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-sky-100">
      <Navbar />

            <div className="bg-gradient-to-r from-blue-800 via-blue-600 to-cyan-500 text-white py-14 px-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Find your next car</h1>
        <p className="text-blue-100">Buy and sell cars across Pakistan</p>
      </div>

      <div className="max-w-5xl mx-auto p-6 -mt-8">
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-lg p-5 mb-8">
          <input
            name="q"
            placeholder="Search (e.g. Corolla, Civic...)"
            value={filters.q}
            onChange={handleChange}
            className={`${inputClass} mb-3`}
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <select name="brand_id" value={filters.brand_id} onChange={handleChange} className={inputClass}>
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <select name="city_id" value={filters.city_id} onChange={handleChange} className={inputClass}>
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <input name="min_price" type="number" placeholder="Min price" value={filters.min_price} onChange={handleChange} className={inputClass} />
            <input name="max_price" type="number" placeholder="Max price" value={filters.max_price} onChange={handleChange} className={inputClass} />
          </div>

          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium">
              Search
            </button>
            <button type="button" onClick={handleReset} className="border border-gray-300 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium">
              Reset
            </button>
          </div>
        </form>

        {loading && <p className="text-gray-600">Loading...</p>}

        {!loading && cars.length === 0 && (
          <p className="text-gray-600 text-center py-10">No cars found. Try changing the filters.</p>
        )}

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <Link
              to={`/cars/${car.id}`}
              key={car.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              <div className="h-44 bg-gray-200 flex items-center justify-center">
                {photos[car.id] ? (
                  <img
                    src={photos[car.id]}
                    alt={car.title}
                    className="w-full h-full object-cover"
                                        onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <span className="text-gray-500 text-sm">No photo</span>
                )}
              </div>
              <div className="p-5">
                <h2 className="font-semibold text-gray-800">{car.title}</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {car.year} • {car.mileage} km • {car.transmission}
                </p>
                <p className="text-blue-600 font-bold text-lg mt-3">
                  Rs {Number(car.price).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;