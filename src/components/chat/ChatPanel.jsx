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
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-line border-t-brand" />
      </div>
    );

  return (
    <div className="flex flex-col bg-white rounded-lg border border-line overflow-hidden" style={{ height: "calc(100vh - 140px)", minHeight: "480px" }}>
      {/* Chat Header */}
      <div className="px-5 py-3 border-b border-line bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-tint rounded flex items-center justify-center">
            <MessageSquare size={18} className="text-brand" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Team Chat</h2>
            <div className="flex items-center gap-1.5 text-xs text-ink-subtle">
              <Hash size={12} />
              <span>general · {messages.length} messages</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-xs text-success font-medium">Live</span>
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
