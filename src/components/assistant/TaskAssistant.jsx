import { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { parseTaskCommand } from "../../services/assistant";
import toast from "react-hot-toast";

export const TaskAssistant = ({ onTaskAction }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: 'Hi! I\'m your AI assistant. I can help you manage tasks. Try commands like:\n- "create task [title] in [project]"\n- "assign [task] to [user]"\n- "move [task] to [status]"',
    },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { type: "user", text: input }]);

    const command = parseTaskCommand(input);

    if (command) {
      onTaskAction(command);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: `Got it! I'll ${command.action} that for you.`,
        },
      ]);
      toast.success("Command processed");
    } else {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Sorry, I didn't understand that command. Please try again.",
        },
      ]);
    }

    setInput("");
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-5 max-w-md border border-purple-200 sticky top-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Bot className="text-white" size={24} />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">AI Assistant</h3>
          <p className="text-xs text-gray-600">Powered by KRISCENT</p>
        </div>
      </div>

      <div className="h-64 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-2xl max-w-[85%] ${
                msg.type === "bot"
                  ? "bg-white text-gray-800 shadow-md border border-gray-200"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
              }`}
            >
              <p className="text-sm whitespace-pre-line leading-relaxed">
                {msg.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a command..."
          className="flex-1 px-4 py-3 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-400"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
