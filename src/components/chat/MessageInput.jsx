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
      className="flex gap-2 p-4 border-t border-line bg-white"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (Enter to send)"
        className="flex-1 px-3 py-2 border border-line rounded text-sm text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
      />
      <button
        type="submit"
        disabled={!message.trim()}
        className="bg-brand text-white px-3.5 py-2 rounded hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm font-medium"
      >
        <Send size={14} />
        <span className="hidden sm:inline">Send</span>
      </button>
    </form>
  );
};
