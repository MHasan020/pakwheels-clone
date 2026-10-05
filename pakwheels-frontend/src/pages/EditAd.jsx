import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function EditAd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
    const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    api.get("/cities").then((res) => setCities(res.data));
    api.get("/brands").then((res) => setBrands(res.data));

    api.get(`/cars/${id}`)
      .then((res) => setForm(res.data))
      .catch(() => setError("Could not load this ad"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (form?.brand_id) {
      api.get(`/brands/${form.brand_id}/models`).then((res) => setModels(res.data));
    }
  }, [form?.brand_id]);

  const loadImages = () =>
    api.get(`/cars/${id}/images`)
      .then((res) => setImages(res.data))
      .catch(() => {});

  useEffect(() => {
    loadImages();
  }, [id]);

  const handleAddPhotos = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const data = new FormData();
        data.append("file", file);
        await api.post(`/cars/${id}/images/upload`, data);
      }
      await loadImages();
    } catch {
      setError("Could not upload the photo. Please try again.");
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleDeletePhoto = async (imageId) => {
    if (!window.confirm("Delete this photo?")) return;
    try {
      await api.delete(`/cars/images/${imageId}`);
      setImages(images.filter((img) => img.id !== imageId));
    } catch {
      setError("Could not delete the photo.");
    }
  };

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
        brand_id: Number(form.brand_id),
        model_id: Number(form.model_id),
        city_id: Number(form.city_id),
        title: form.title,
        description: form.description,
        price: Number(form.price),
        year: Number(form.year),
        mileage: form.mileage ? Number(form.mileage) : null,
        fuel_type: form.fuel_type,
        transmission: form.transmission,
        condition_type: form.condition_type,
        color: form.color,
        registration_city: form.registration_city,
      };
      await api.put(`/cars/${id}`, payload);
      navigate(`/cars/${id}`);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You are not authorized to edit this ad.");
      } else {
        setError("Could not update the ad. Please check all required fields.");
      }
    }
  };

  const inputClass = "w-full border rounded p-2";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <p className="p-6">Loading...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <p className="p-6 text-red-600">{error || "Ad not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Edit Ad</h1>

          {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select name="brand_id" value={form.brand_id} onChange={handleChange} className={inputClass} required>
              <option value="">Select brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <select name="model_id" value={form.model_id} onChange={handleChange} className={inputClass} required>
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

            <input name="registration_city" placeholder="Registered in (city)" value={form.registration_city || ""} onChange={handleChange} className={inputClass} />
          </div>

          <input name="title" placeholder="Title" value={form.title} onChange={handleChange} className={`${inputClass} mt-4`} required />

          <textarea name="description" placeholder="Description" value={form.description || ""} onChange={handleChange} className={`${inputClass} mt-4`} rows="3" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <input name="price" type="number" placeholder="Price (Rs)" value={form.price} onChange={handleChange} className={inputClass} required />
            <input name="year" type="number" placeholder="Year" value={form.year} onChange={handleChange} className={inputClass} required />
            <input name="mileage" type="number" placeholder="Mileage (km)" value={form.mileage || ""} onChange={handleChange} className={inputClass} />
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

          <input name="color" placeholder="Color" value={form.color || ""} onChange={handleChange} className={`${inputClass} mt-4`} />

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded mt-6 hover:bg-blue-700">
            Save Changes
          </button>
        </form>

                <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-bold mb-4">Photos</h2>

          {images.length === 0 && (
            <p className="text-gray-500 text-sm mb-4">No photos yet.</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {images.map((img) => (
              <div key={img.id} className="border rounded overflow-hidden">
                <img src={img.image_url} alt="" className="h-28 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(img.id)}
                  className="w-full text-red-600 text-sm py-1 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <label className="inline-block bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
            {uploading ? "Uploading..." : "Add photos"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddPhotos}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default EditAd;