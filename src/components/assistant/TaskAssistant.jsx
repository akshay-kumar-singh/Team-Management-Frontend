import { useState, useRef } from "react";
import { Bot, Send, Loader, FileText, Upload } from "lucide-react";
import api from "../../services/api";

// The LLM call happens server-side (/api/agent/assistant) so the
// Groq API key never ships in the browser bundle
const callAssistant = async (userMessage, tasks) => {
  const { data } = await api.post("/api/agent/assistant", {
    message: userMessage,
    tasks: tasks.map((t) => ({
      _id: t._id,
      title: t.title,
      status: t.status,
      assignedTo: t.assignedTo ? { name: t.assignedTo.name } : null,
    })),
  });

  if (!Array.isArray(data.commands)) throw new Error("Invalid assistant response");
  return data.commands;
};
// ── Component ──
export const TaskAssistant = ({ onTaskAction, tasks = [], projectId, onImported }) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: `Hi! I'm your AI assistant powered by Workzen 🤖

You can talk to me naturally! For example:
- "Create a task to fix the login bug"
- "Mark the homepage design task as done"
- "Move fix login to in progress"
- "Assign the API task to John"

Just tell me what you want to do! 🚀`,
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { type: "user", text: userText }]);
    setIsLoading(true);

    setTimeout(scrollToBottom, 100);

    let actionSucceeded = false;

    try {
      const commands = await callAssistant(userText, tasks);
      const statusLabel = {
        todo: "To Do",
        "in-progress": "In Progress",
        "in-review": "In Review",
        done: "Done",
      };

      // Track newly created tasks in this session so chained assign works
      const newlyCreatedTasks = [];

      for (const command of commands) {
        if (command.action === "unknown") {
          actionSucceeded = true;
          setMessages((prev) => [
            ...prev,
            { type: "bot", text: command.reply },
          ]);
        } else if (command.action === "create") {
          const newTask = await onTaskAction({
            action: "create",
            title: command.title,
            description: command.description || "",
          });
          // Store newly created task so chained assign can find it
          if (newTask) newlyCreatedTasks.push(newTask);
          actionSucceeded = true;
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: `✅ Task "${command.title}" created!${
                command.description ? `\n📝 "${command.description}"` : ""
              }`,
            },
          ]);
        } else if (command.action === "move") {
          await onTaskAction({
            action: "move",
            taskTitle: command.taskTitle,
            taskId: command.taskId,
            status: command.status,
          });
          actionSucceeded = true;
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: `✅ "${command.taskTitle}" moved to ${statusLabel[command.status]}!`,
            },
          ]);
        } else if (command.action === "assign") {
          const justCreated = newlyCreatedTasks.find((t) =>
            t.title.toLowerCase().includes(command.taskTitle?.toLowerCase()),
          );
          await onTaskAction({
            action: "assign",
            taskTitle: command.taskTitle,
            taskId: justCreated?._id || command.taskId, // Use fresh taskId if available
            user: command.user,
          });
          actionSucceeded = true;
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: `✅ "${command.taskTitle}" assigned to ${command.user}!`,
            },
          ]);
        } else if (command.action === "delete") {
          await onTaskAction({
            action: "delete",
            taskTitle: command.taskTitle,
            taskId: command.taskId,
          });
          actionSucceeded = true;
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: `🗑️ "${command.taskTitle}" deleted successfully!`,
            },
          ]);
        }
      }
    } catch {
      if (!actionSucceeded) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "❌ Something went wrong. Please try again.",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const handlePrdUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-uploading the same file
    if (!file || importing) return;
    if (!projectId) {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "⚠️ Open a project first, then upload the PRD there." },
      ]);
      return;
    }

    setImporting(true);
    setMessages((prev) => [
      ...prev,
      { type: "user", text: `📄 Uploaded PRD: ${file.name}` },
      { type: "bot", text: "Reading your PRD and breaking it into tickets… this usually takes ~10-20s." },
    ]);
    setTimeout(scrollToBottom, 100);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("projectId", projectId);
      const { data } = await api.post("/api/agent/prd", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const lines = [`✅ Created ${data.createdCount} item(s) from your PRD.`];
      if (data.summary) lines.push(`\n📋 ${data.summary}`);
      if (data.epics?.length)
        lines.push(`\nEpics:\n${data.epics.map((x) => `• ${x.key} — ${x.title}`).join("\n")}`);
      if (data.issues?.length)
        lines.push(
          `\nIssues:\n${data.issues
            .map((x) => `• ${x.key} — ${x.title}${x.assignee ? `  →  ${x.assignee}` : ""}`)
            .join("\n")}`
        );
      if (data.assignedDevs?.length)
        lines.push(`\n👥 Assigned: ${data.assignedDevs.map((d) => `${d.name} (${d.count})`).join(", ")}`);

      setMessages((prev) => [...prev, { type: "bot", text: lines.join("\n") }]);
      onImported?.();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: `❌ ${err.message || "PRD import failed. Please try again."}` },
      ]);
    } finally {
      setImporting(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-line p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative">
          <div className="w-10 h-10 bg-brand-tint rounded flex items-center justify-center">
            <Bot className="text-brand" size={20} />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-white" />
        </div>
        <div>
          <h3 className="font-semibold text-ink text-sm">AI Assistant</h3>
          <p className="text-xs text-ink-subtle">
            {isLoading ? "⚙️ Thinking..." : "Powered by Workzen ✨"}
          </p>
        </div>
      </div>

      {/* PRD → tickets */}
      <div className="mb-4 rounded border border-dashed border-line bg-canvas p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <FileText size={14} className="text-brand" />
          <span className="text-xs font-semibold text-ink">Generate tickets from a PRD</span>
        </div>
        <p className="text-[11px] text-ink-subtle mb-2 leading-relaxed">
          Upload a PRD (PDF, DOCX or .md). I'll create the epics &amp; issues and assign them to the
          developers named in it.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.md,.markdown,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
          className="hidden"
          onChange={handlePrdUpload}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing || !projectId}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-brand text-white hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {importing ? (
            <>
              <Loader size={13} className="animate-spin" /> Reading PRD…
            </>
          ) : (
            <>
              <Upload size={13} /> Upload PRD
            </>
          )}
        </button>
        {!projectId && (
          <span className="ml-2 text-[11px] text-ink-subtle">Open a project first</span>
        )}
      </div>

      {/* Messages */}
      <div className="h-64 sm:h-80 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent bg-canvas rounded p-3 border border-line">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-3.5 py-2.5 rounded-lg max-w-[85%] ${
                msg.type === "bot"
                  ? "bg-white text-ink border border-line"
                  : "bg-brand text-white"
              }`}
            >
              <p className="text-sm whitespace-pre-line leading-relaxed">
                {msg.text}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-line px-3.5 py-2.5 rounded-lg flex items-center gap-2">
              <Loader size={14} className="animate-spin text-brand" />
              <span className="text-sm text-ink-subtle">
                Workzen is Working...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          disabled={isLoading}
          className="flex-1 min-w-0 px-3 py-2 bg-white border border-line rounded text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand placeholder-gray-400 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-brand text-white p-2.5 rounded hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {isLoading ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>
    </div>
  );
};
