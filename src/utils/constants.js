export const USER_ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  MEMBER: "MEMBER",
};

export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in-progress",
  DONE: "done",
};

export const TASK_COLUMNS = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export const API_ENDPOINTS = {
  PROJECTS: "/api/projects",
  TASKS: "/api/tasks",
  MESSAGES: "/api/messages",
  USERS: "/api/users",
};
