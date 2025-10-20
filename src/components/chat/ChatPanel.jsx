import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../hooks/useAuth";
import { MessageSquare } from "lucide-react";

export const ChatPanel = () => {
  const { userData } = useAuth();
  const { messages, loading, sendMessage } = useChat(userData?.teamId);

  const handleSend = async (content) => {
    await sendMessage(content);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[calc(100vh-180px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow h-[calc(100vh-180px)] flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <MessageSquare size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Team Chat</h2>
            <p className="text-sm text-gray-600">{messages.length} messages</p>
          </div>
        </div>
      </div>
      <MessageList messages={messages} />
      <MessageInput onSend={handleSend} />
    </div>
  );
};
