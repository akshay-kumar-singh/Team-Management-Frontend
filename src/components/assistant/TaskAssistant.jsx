import { useState, useRef } from "react";
import { Bot, Send, Loader } from "lucide-react";

// ── Gemini API call ──
const callGroq = async (userMessage, tasks) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  const taskList =
    tasks.length > 0
      ? tasks
          .map(
            (t) =>
              `- ID: ${t._id} | Title: "${t.title}" | Status: ${t.status} | Assigned: ${
                t.assignedTo?.name || "Unassigned"
              }`,
          )
          .join("\n")
      : "No tasks yet.";

  const systemPrompt = `You are a task management assistant for a project management app called Workzen.
Your job is to understand what the user wants to do and return a JSON command.

Current tasks in the board:
${taskList}

You must respond ONLY with a valid JSON object — no explanation, no markdown, no extra text.

Supported actions and their JSON format:

1. Create a task (with optional description):
{"action":"create","title":"task title here","description":"optional description here"}

2. Move a task to a different status:
{"action":"move","taskId":"the_task_id","taskTitle":"task title","status":"todo|in-progress|done"}

3. Assign a task to someone:
{"action":"assign","taskId":"the_task_id","taskTitle":"task title","user":"person name"}

4. Delete a task:
{"action":"delete","taskId":"the_task_id","taskTitle":"task title"}

5. If you cannot understand or it's not a task command:
{"action":"unknown","reply":"your helpful response here"}

Important rules:
- Match task titles case-insensitively from the current task list
- For move action, map words like "complete/finish/done" to "done", "start/progress/working" to "in-progress", "back/todo/reset" to "todo"
- Always include taskId when you find a matching task
- If user says something casual like "hi", use "unknown" action with a friendly reply
- If the user wants to do MULTIPLE things in one message (e.g. create a task AND assign it), return a JSON array of commands like:
[{"action":"create","title":"fix login","description":"fix the login bug"},{"action":"assign","taskId":"xxx","taskTitle":"fix login","user":"John"}]
- If only one action, return a single JSON object (not an array)`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Free model on Groq
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.1,
        max_tokens: 200,
      }),
    },
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Groq API error");
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();

  if (!text) throw new Error("Empty response from Groq");

  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  // Always return array for uniform handling
  return Array.isArray(parsed) ? parsed : [parsed];
};
// ── Component ──
export const TaskAssistant = ({ onTaskAction, tasks = [] }) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      const commands = await callGroq(userText, tasks);
      const statusLabel = {
        todo: "To Do",
        "in-progress": "In Progress",
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
    } catch (error) {
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

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-5 max-w-md border border-purple-200 sticky top-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Bot className="text-white" size={24} />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">AI Assistant</h3>
          <p className="text-xs text-gray-600">
            {isLoading ? "⚙️ Thinking..." : "Powered by Workzen ✨"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="h-[416px] overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
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

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-2xl shadow-md flex items-center gap-2">
              <Loader size={14} className="animate-spin text-purple-500" />
              <span className="text-sm text-gray-500">
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
          className="flex-1 min-w-0 px-4 py-3 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-400 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl hover:from-purple-600 hover:to-pink-600 shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex-shrink-0"
        >
          {isLoading ? (
            <Loader size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
    </div>
  );
};
