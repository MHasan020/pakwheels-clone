import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    api.get("/messages/inbox")
      .then((res) => setConversations(res.data))
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>

        {loading && <p>Loading...</p>}

        {!loading && conversations.length === 0 && (
          <p className="text-gray-600">No conversations yet.</p>
        )}

        <div className="space-y-3">
          {conversations.map((c) => (
            <Link
              key={`${c.car_id}-${c.other_user_id}`}
              to={`/messages/${c.car_id}/${c.other_user_id}`}
              className="block bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
            >
              <p className="font-semibold">{c.car_title}</p>
              <p className="text-sm text-gray-600">With: {c.other_user_name}</p>
              <p className="text-sm text-gray-500 mt-1 truncate">{c.last_message}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Messages;