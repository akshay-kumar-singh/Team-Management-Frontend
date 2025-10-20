import { useEffect, useRef } from "react";
import { formatTime } from "../../utils/helpers";
import { useAuth } from "../../hooks/useAuth";
import { getInitials } from "../../utils/helpers";

export const MessageList = ({ messages }) => {
  const { userData } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
      {messages.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No messages yet. Start the conversation! 💬
        </div>
      )}

      {messages.map((message) => {
        const senderId =
          typeof message.senderId === "object"
            ? message.senderId?._id
            : message.senderId;
        const userDataId = userData?._id;

        const isOwnMessage = senderId?.toString() === userDataId?.toString();

        return (
          <div
            key={message._id}
            className={`flex ${
              isOwnMessage ? "justify-end" : "justify-start"
            } animate-fadeIn`}
          >
            <div
              className={`flex gap-3 max-w-[70%] ${
                isOwnMessage ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-10 h-10 bg-gradient-to-br ${
                  isOwnMessage
                    ? "from-purple-500 to-pink-500"
                    : "from-blue-500 to-cyan-500"
                } rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-lg flex-shrink-0`}
              >
                {getInitials(message.senderId?.name || "U")}
              </div>
              <div className="flex-1">
                <div
                  className={`rounded-2xl p-4 shadow-md ${
                    isOwnMessage
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  <p className="text-sm font-semibold mb-1 opacity-90">
                    {message.senderId?.name || "Unknown"}
                  </p>
                  <p className="leading-relaxed">{message.content}</p>
                </div>
                <p
                  className={`text-xs text-gray-500 mt-2 ${
                    isOwnMessage ? "text-right" : "text-left"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
