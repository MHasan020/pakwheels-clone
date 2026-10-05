import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function MessageThread() {
  const { carId, otherUserId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const bottomRef = useRef(null);

  const loadMessages = () => {
    api.get(`/messages/car/${carId}/with/${otherUserId}`).then((res) => setMessages(res.data));
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    api.get("/auth/me").then((res) => setCurrentUser(res.data));
    loadMessages();
  }, [carId, otherUserId, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await api.post("/messages/", {
      car_id: Number(carId),
      receiver_id: Number(otherUserId),
      message_text: text,
    });
    setText("");
    loadMessages();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 flex-1 flex flex-col w-full">
        <div className="bg-white rounded-lg shadow flex-1 p-4 mb-4 overflow-y-auto max-h-[60vh]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`mb-3 max-w-xs p-2 rounded-lg text-sm ${
                currentUser && m.sender_id === currentUser.id
                  ? "bg-blue-600 text-white ml-auto"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {m.message_text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded p-2"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default MessageThread;