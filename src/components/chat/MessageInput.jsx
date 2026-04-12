import { useState } from "react";
import { Send } from "lucide-react";

export const MessageInput = ({ onSend }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        onSend(message);
        setMessage("");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3 p-4 border-t border-gray-200 bg-white"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (Enter to send)"
        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm placeholder-gray-400"
      />
      <button
        type="submit"
        disabled={!message.trim()}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2.5 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105 active:scale-95 flex items-center gap-2 text-sm font-medium"
      >
        <Send size={16} />
        <span className="hidden sm:inline">Send</span>
      </button>
    </form>
  );
};
