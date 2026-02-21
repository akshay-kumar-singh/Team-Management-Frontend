export const parseTaskCommand = (command) => {
  if (!command || !command.trim()) return null;

  const trimmed = command.trim();
  const lower = trimmed.toLowerCase();

  // ── CREATE TASK ──
  // Accepts: "create task Fix login bug" or "create task Fix login bug in ProjectName"
  if (lower.startsWith("create task")) {
    const withoutPrefix = trimmed.slice("create task".length).trim();
    if (!withoutPrefix) return null;

    // Check if "in <project>" is at the end
    const inMatch = withoutPrefix.match(/^(.+?)\s+in\s+([^]+)$/i);
    if (inMatch) {
      return {
        action: "create",
        title: inMatch[1].trim(),
        project: inMatch[2].trim(),
      };
    }

    return {
      action: "create",
      title: withoutPrefix,
      project: null,
    };
  }

  // ── MOVE TASK ──
  // Accepts: "move Fix login bug to done" / "to in progress" / "to todo"
  if (lower.startsWith("move")) {
    const withoutMove = trimmed.slice("move".length).trim();
    const toIndex = withoutMove.toLowerCase().lastIndexOf(" to ");

    if (toIndex === -1) return null;

    const taskTitle = withoutMove.slice(0, toIndex).trim();
    const statusInput = withoutMove.slice(toIndex + 4).trim().toLowerCase();

    let status = null;
    if (statusInput.includes("progress")) {
      status = "in-progress";
    } else if (
      statusInput === "done" ||
      statusInput === "complete" ||
      statusInput === "completed" ||
      statusInput === "finish" ||
      statusInput === "finished"
    ) {
      status = "done";
    } else if (
      statusInput === "todo" ||
      statusInput === "to do" ||
      statusInput === "backlog" ||
      statusInput === "start"
    ) {
      status = "todo";
    }

    if (!status || !taskTitle) return null;

    return {
      action: "move",
      taskTitle,
      status,
    };
  }

  // ── ASSIGN TASK ──
  // Accepts: "assign Fix login bug to John"
  if (lower.startsWith("assign")) {
    const withoutAssign = trimmed.slice("assign".length).trim();
    const toIndex = withoutAssign.toLowerCase().lastIndexOf(" to ");

    if (toIndex === -1) return null;

    const task = withoutAssign.slice(0, toIndex).trim();
    const user = withoutAssign.slice(toIndex + 4).trim();

    if (!task || !user) return null;

    return {
      action: "assign",
      task,
      user,
    };
  }

  return null;
};