import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../hooks/useAuth";
import { MessageSquare, Hash } from "lucide-react";

export const ChatPanel = () => {
  const { userData } = useAuth();
  const { messages, loading, sendMessage } = useChat(userData?.teamId);

  const handleSend = async (content) => {
    await sendMessage(content);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
      </div>
    );

  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden" style={{ height: "calc(100vh - 140px)", minHeight: "480px" }}>
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
            <MessageSquare size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Team Chat</h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Hash size={12} />
              <span>general · {messages.length} messages</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-600 font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Input */}
      <MessageInput onSend={handleSend} />
    </div>
  );
};
