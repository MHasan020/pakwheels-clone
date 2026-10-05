import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function PostAd() {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    brand_id: "",
    model_id: "",
    city_id: "",
    title: "",
    description: "",
    price: "",
    year: "",
    mileage: "",
    fuel_type: "petrol",
    transmission: "manual",
    condition_type: "used",
    color: "",
    registration_city: "",
  });

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    api.get("/auth/me")
      .then((res) => {
        if (res.data.role === "buyer") {
          navigate("/");
        }
      })
      .catch(() => {});
  }, [navigate]);

  useEffect(() => {
    api.get("/cities").then((res) => setCities(res.data));
    api.get("/brands").then((res) => setBrands(res.data));
  }, []);

  useEffect(() => {
    if (form.brand_id) {
      api.get(`/brands/${form.brand_id}/models`).then((res) => setModels(res.data));
    } else {
      setModels([]);
    }
  }, [form.brand_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "brand_id") {
      setForm({ ...form, brand_id: value, model_id: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        brand_id: Number(form.brand_id),
        model_id: Number(form.model_id),
        city_id: Number(form.city_id),
        price: Number(form.price),
        year: Number(form.year),
        mileage: form.mileage ? Number(form.mileage) : null,
      };
      const res = await api.post("/cars/", payload);
      const carId = res.data.id;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        await api.post(`/cars/${carId}/images/upload?is_primary=true`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate(`/cars/${carId}`);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else if (err.response?.status === 403) {
        setError("Only sellers can post ads.");
      } else {
        setError("Could not post the ad. Please check all required fields.");
      }
    }
  };

  const inputClass = "w-full border rounded p-2";

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Post an Ad</h1>

          {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select name="brand_id" value={form.brand_id} onChange={handleChange} className={inputClass} required>
              <option value="">Select brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <select name="model_id" value={form.model_id} onChange={handleChange} className={inputClass} required disabled={!form.brand_id}>
              <option value="">Select model</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            <select name="city_id" value={form.city_id} onChange={handleChange} className={inputClass} required>
              <option value="">Select city</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <input name="registration_city" placeholder="Registered in (city)" value={form.registration_city} onChange={handleChange} className={inputClass} />
          </div>

          <input name="title" placeholder="Title (e.g. Toyota Corolla 2021 - Excellent)" value={form.title} onChange={handleChange} className={`${inputClass} mt-4`} required />

          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className={`${inputClass} mt-4`} rows="3" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <input name="price" type="number" placeholder="Price (Rs)" value={form.price} onChange={handleChange} className={inputClass} required />
            <input name="year" type="number" placeholder="Year" value={form.year} onChange={handleChange} className={inputClass} required />
            <input name="mileage" type="number" placeholder="Mileage (km)" value={form.mileage} onChange={handleChange} className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <select name="fuel_type" value={form.fuel_type} onChange={handleChange} className={inputClass}>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybrid</option>
              <option value="electric">Electric</option>
            </select>
            <select name="transmission" value={form.transmission} onChange={handleChange} className={inputClass}>
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </select>
            <select name="condition_type" value={form.condition_type} onChange={handleChange} className={inputClass}>
              <option value="used">Used</option>
              <option value="new">New</option>
            </select>
          </div>

          <input name="color" placeholder="Color" value={form.color} onChange={handleChange} className={`${inputClass} mt-4`} />

          <div className="mt-4">
            <label className="block text-sm text-gray-600 mb-1">Photo (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className={inputClass}
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded mt-6 hover:bg-blue-700">
            Post Ad
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostAd;