import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import { SITE_NAME } from "../config";

const HIDDEN_PATHS = ["/login", "/register", "/welcome", "/forgot-password", "/reset-password"];

const GREETING = {
  role: "assistant",
  content: `Hi! I am the ${SITE_NAME} Assistant. Ask me how to post an ad, how the website works, or for car buying tips.`,
};

function ChatWidget() {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, sending]);

  useEffect(() => {
    if (!token) {
      setMessages([GREETING]);
      setOpen(false);
      setError("");
    }
  }, [token]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setError("");
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);

    try {
      const res = await api.post("/chat/", { messages: next.slice(1) });
      setMessages([...next, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setError("Please log in again to chat.");
      } else {
        setError(err.response?.data?.detail || "Something went wrong. Please try again.");
      }
    }
    setSending(false);
  };

  if (!token || HIDDEN_PATHS.includes(location.pathname)) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-80 sm:w-96 h-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 py-3 flex justify-between items-center">
            <div>
              <p className="font-semibold">{SITE_NAME} Assistant</p>
              <p className="text-xs text-blue-100">Ask me about the website or buying a car</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-2xl leading-none hover:text-yellow-300"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 text-gray-500 px-3 py-2 rounded-2xl text-sm">
                  Typing...
                </div>
              </div>
            )}

            {error && <p className="bg-red-100 text-red-700 p-2 rounded text-xs">{error}</p>}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-gray-200 flex gap-2 bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              maxLength={500}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close chat" : "Open chat"}
          className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-xl hover:bg-blue-700 transition text-2xl flex items-center justify-center"
        >
          {open ? "×" : "💬"}
        </button>
      </div>
    </div>
  );
}

export default ChatWidget;