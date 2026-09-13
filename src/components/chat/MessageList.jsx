import { useLayoutEffect, useRef } from "react";
import { formatTime } from "../../utils/helpers";
import { useAuth } from "../../hooks/useAuth";
import { getInitials } from "../../utils/helpers";

export const MessageList = ({ messages, hasMore, onLoadEarlier, loadingEarlier }) => {
  const { userData } = useAuth();
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const prevFirstId = useRef(null);
  const prevScrollHeight = useRef(0);

  // Scroll to the bottom for new/initial messages, but preserve the viewport
  // when older messages are prepended via "Load earlier".
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const firstId = messages[0]?._id ?? null;
    const prepended =
      prevFirstId.current &&
      firstId !== prevFirstId.current &&
      messages.some((m) => m._id === prevFirstId.current); // old top still present → added above

    if (prepended) {
      el.scrollTop = el.scrollTop + (el.scrollHeight - prevScrollHeight.current);
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevFirstId.current = firstId;
    prevScrollHeight.current = el.scrollHeight;
  }, [messages]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-canvas">
      {hasMore && (
        <div className="text-center pb-1">
          <button
            onClick={onLoadEarlier}
            disabled={loadingEarlier}
            className="text-xs text-brand hover:underline disabled:opacity-50 disabled:no-underline py-1"
          >
            {loadingEarlier ? "Loading…" : "Load earlier messages"}
          </button>
        </div>
      )}
      {messages.length === 0 && (
        <div className="text-center text-ink-subtle py-12 text-sm">
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
                className={`w-8 h-8 ${
                  isOwnMessage ? "bg-brand" : "bg-ink-subtle"
                } rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
              >
                {getInitials(message.senderId?.name || "U")}
              </div>
              <div className="flex-1">
                <div
                  className={`rounded-lg px-3.5 py-2.5 ${
                    isOwnMessage
                      ? "bg-brand text-white"
                      : "bg-white text-ink border border-line"
                  }`}
                >
                  <p className="text-xs font-semibold mb-0.5 opacity-80">
                    {message.senderId?.name || "Unknown"}
                  </p>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <p
                  className={`text-[11px] text-ink-subtle mt-1 ${
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
