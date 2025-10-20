export const parseTaskCommand = (command) => {
  const lowerCommand = command.toLowerCase().trim();

  if (lowerCommand.startsWith("create task")) {
    const match = command.match(/create task (.*?)(?:\s+in\s+(.*))?$/i);
    if (match) {
      return {
        action: "create",
        title: match[1].trim(),
        project: match[2]?.trim(),
      };
    }
  }

  if (lowerCommand.startsWith("assign")) {
    const match = command.match(/assign (.*?)\s+to\s+(.*)$/i);
    if (match) {
      return {
        action: "assign",
        task: match[1].trim(),
        user: match[2].trim(),
      };
    }
  }

  if (lowerCommand.startsWith("move")) {
    const match = command.match(/move (.*?)\s+to\s+(.*)$/i);
    if (match) {
      const taskTitle = match[1].trim();
      const statusInput = match[2].trim().toLowerCase();

      let status = "todo";
      if (statusInput.includes("progress") || statusInput === "in progress") {
        status = "in-progress";
      } else if (
        statusInput.includes("done") ||
        statusInput === "complete" ||
        statusInput === "completed"
      ) {
        status = "done";
      } else if (statusInput.includes("todo") || statusInput === "to do") {
        status = "todo";
      }

      return {
        action: "move",
        taskTitle: taskTitle,
        status: status,
      };
    }
  }

  return null;
};
