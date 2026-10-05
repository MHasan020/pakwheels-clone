import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function CarDetail() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [isFav, setIsFav] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    api.get(`/cars/${id}`)
      .then((res) => setCar(res.data))
      .catch(() => setError("Car not found"));
    api.get(`/cars/${id}/images`)
      .then((res) => setImages(res.data))
      .catch(() => {});

    if (token) {
      api.get("/auth/me").then((res) => setCurrentUser(res.data));
      api.get("/cars/my/favorites")
        .then((res) => setIsFav(res.data.some((c) => c.id === Number(id))))
        .catch(() => {});
    }
  }, [id, token]);

  const toggleFavorite = async () => {
    if (!token) return;
    if (isFav) {
      await api.delete(`/cars/${id}/favorite`);
      setIsFav(false);
    } else {
      await api.post(`/cars/${id}/favorite`);
      setIsFav(true);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    await api.post("/messages/", {
      car_id: Number(id),
      receiver_id: car.seller_id,
      message_text: messageText,
    });
    setMessageText("");
    setMessageSent(true);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <p className="p-6 text-red-600">{error}</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <p className="p-6">Loading...</p>
      </div>
    );
  }

  const isOwner = currentUser && currentUser.id === car.seller_id;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
                    <div className="bg-gray-200 rounded h-64 mb-2 flex items-center justify-center overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[activeImage]?.image_url}
                alt={car.title}
                className="w-full h-full object-cover"
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              <span className="text-gray-500">No photo</span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img.image_url}
                  alt=""
                  onClick={() => setActiveImage(index)}
                  className={`h-16 w-24 object-cover rounded cursor-pointer border-2 ${
                    index === activeImage ? "border-blue-600" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          )}

          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold">{car.title}</h1>
            {token && (
              <button
                onClick={toggleFavorite}
                className={`text-2xl ${isFav ? "text-red-500" : "text-gray-300"}`}
                title={isFav ? "Remove from favorites" : "Add to favorites"}
              >
                ♥
              </button>
            )}
          </div>

          <p className="text-blue-600 text-xl font-bold mt-2">
            Rs {Number(car.price).toLocaleString()}
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4 text-sm text-gray-700">
            <p>Year: {car.year}</p>
            <p>Mileage: {car.mileage} km</p>
            <p>Fuel: {car.fuel_type}</p>
            <p>Transmission: {car.transmission}</p>
            <p>Condition: {car.condition_type}</p>
            <p>Color: {car.color}</p>
            <p>Registered in: {car.registration_city}</p>
          </div>

          <p className="mt-4 text-gray-700">{car.description}</p>
        </div>

        {token && !isOwner && (
          <div className="bg-white rounded-lg shadow p-6 mt-4">
            <h2 className="font-semibold mb-2">Message the seller</h2>
            {messageSent && (
              <p className="text-green-700 bg-green-100 p-2 rounded mb-2 text-sm">
                Message sent.{" "}
                <Link to={`/messages/${id}/${car.seller_id}`} className="underline">
                  View conversation
                </Link>
              </p>
            )}
            <form onSubmit={handleSendMessage}>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your question..."
                className="w-full border rounded p-2"
                rows="3"
                required
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700">
                Send
              </button>
            </form>
          </div>
        )}

                {token && isOwner && (
          <div className="bg-white rounded-lg shadow p-4 mt-4 text-sm text-gray-600 flex items-center justify-between">
            <span>
              This is your own ad.{" "}
              <Link to="/messages" className="text-blue-600 underline">View messages inbox</Link>
            </span>
            <Link
              to={`/edit-ad/${id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Edit Ad
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default CarDetail;