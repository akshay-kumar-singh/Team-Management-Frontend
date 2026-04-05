export const USER_ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  MEMBER: "MEMBER",
};

export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in-progress",
  IN_REVIEW: "in-review",
  DONE: "done",
};

export const TASK_COLUMNS = [
  { id: "todo", title: "To Do", color: "from-blue-500 to-cyan-500" },
  { id: "in-progress", title: "In Progress", color: "from-amber-500 to-orange-500" },
  { id: "in-review", title: "In Review", color: "from-purple-500 to-pink-500" },
  { id: "done", title: "Done", color: "from-green-500 to-emerald-500" },
];

export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

export const TASK_TYPE = {
  TASK: "task",
  BUG: "bug",
  FEATURE: "feature",
};

export const AGENT_STATUS_LABELS = {
  queued: "⏳ Queued",
  cloning: "📦 Cloning Repo",
  analyzing: "🔍 Analyzing Code",
  coding: "🧠 Writing Code",
  pushing: "📤 Pushing to GitHub",
  "creating-pr": "🔗 Creating PR",
  completed: "✅ Completed",
  failed: "❌ Failed",
  revising: "📝 Revising Code",
};

export const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export const TYPE_ICONS = {
  task: "📋",
  bug: "🐛",
  feature: "✨",
};

export const API_ENDPOINTS = {
  PROJECTS: "/api/projects",
  TASKS: "/api/tasks",
  MESSAGES: "/api/messages",
  USERS: "/api/users",
  AGENT: "/api/agent",
};
