import { KanbanBoard } from "../components/tasks/KanbanBoard";
import { TaskAssistant } from "../components/assistant/TaskAssistant";
import { AgentActivityPanel } from "../components/agent/AgentActivityPanel";
import { useTasks } from "../hooks/useTasks";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export const Tasks = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const { tasks, createTask, updateTask, deleteTask } = useTasks(projectId);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data } = await api.get("/api/users/team");
        setTeamMembers(data);
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      }
    };
    fetchMembers();
  }, []);

  const handleTaskAction = async (command) => {
    try {
      if (command.action === "create") {
        const newTask = await createTask({
          title: command.title,
          description: command.description || "",
          status: "todo",
        });
        return newTask; // Return so assistant can use it for chained assign
      } else if (command.action === "move") {
        const taskToMove =
          tasks.find((t) => t._id === command.taskId) ||
          tasks.find((t) =>
            t.title.toLowerCase().includes(command.taskTitle?.toLowerCase()),
          );

        if (taskToMove) {
          // Always include existing assignedTo so it never gets wiped
          await updateTask(taskToMove._id, {
            status: command.status,
            assignedTo:
              taskToMove.assignedTo?._id || taskToMove.assignedTo || null,
          });
        } else {
          toast.error("Task not found");
        }
      } else if (command.action === "assign") {
        // If taskId is directly provided (e.g. from chained create+assign),
        // use it directly — don't search tasks array which may not have new task yet
        const taskId =
          command.taskId ||
          tasks.find((t) =>
            t.title.toLowerCase().includes(command.taskTitle?.toLowerCase()),
          )?._id;

        if (!taskId) {
          toast.error("Task not found");
          return;
        }

        const userToAssign = teamMembers.find((m) =>
          m.name.toLowerCase().includes(command.user?.toLowerCase()),
        );

        if (!userToAssign) {
          toast.error(`User "${command.user}" not found in team`);
          return;
        }

        await updateTask(taskId, { assignedTo: userToAssign._id });
      } else if (command.action === "delete") {
        const taskToDelete =
          tasks.find((t) => t._id === command.taskId) ||
          tasks.find((t) =>
            t.title.toLowerCase().includes(command.taskTitle?.toLowerCase()),
          );

        if (taskToDelete) {
          await deleteTask(taskToDelete._id);
        } else {
          toast.error("Task not found");
        }
      }
    } catch (error) {
      console.error("Task action error:", error);
      toast.error("Failed to process command");
    }
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <KanbanBoard
          tasks={tasks}
          createTask={createTask}
          updateTask={updateTask}
          deleteTask={deleteTask}
        />
      </div>
      <div className="w-96 flex flex-col gap-6">
        <TaskAssistant onTaskAction={handleTaskAction} tasks={tasks} />
        <AgentActivityPanel />
      </div>
    </div>
  );
};
