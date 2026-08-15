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

// Fallback board columns (matches the backend default) for legacy projects
// whose config hasn't loaded / been migrated yet
export const DEFAULT_BOARD_COLUMNS = [
  { id: "todo", name: "To Do", wipLimit: null },
  { id: "in-progress", name: "In Progress", wipLimit: null },
  { id: "in-review", name: "In Review", wipLimit: null },
  { id: "done", name: "Done", wipLimit: null },
];

export const columnsOf = (project) =>
  project?.columns?.length ? project.columns : DEFAULT_BOARD_COLUMNS;

export const doneColumnId = (columns) =>
  columns?.length ? columns[columns.length - 1].id : "done";

export const SWIMLANE_OPTIONS = [
  { id: "none", label: "No swimlanes" },
  { id: "assignee", label: "Assignee" },
  { id: "epic", label: "Epic" },
  { id: "priority", label: "Priority" },
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
  EPIC: "epic",
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
  epic: "🗲",
};

// Deterministic chip color for a label string (same label → same color)
export const LABEL_PALETTE = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
  "bg-rose-100 text-rose-700",
];

export const labelColor = (label = "") => {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  return LABEL_PALETTE[hash % LABEL_PALETTE.length];
};

export const API_ENDPOINTS = {
  PROJECTS: "/api/projects",
  TASKS: "/api/tasks",
  MESSAGES: "/api/messages",
  USERS: "/api/users",
  AGENT: "/api/agent",
};
