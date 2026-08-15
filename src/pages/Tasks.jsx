import { KanbanBoard } from "../components/tasks/KanbanBoard";
import { TaskAssistant } from "../components/assistant/TaskAssistant";
import { AgentActivityPanel } from "../components/agent/AgentActivityPanel";
import { useTasks } from "../hooks/useTasks";
import { useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export const Tasks = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const { tasks, createTask, updateTask, deleteTask, reorderColumn, fetchTasks } =
    useTasks(projectId);
  const [teamMembers, setTeamMembers] = useState([]);
  const [project, setProject] = useState(null);

  // Board config (columns / transitions) lives on the project
  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    try {
      const { data } = await api.get("/api/projects");
      setProject(data.find((p) => p._id === projectId) || null);
    } catch {
      /* board falls back to default columns */
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

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
        return newTask;
      } else if (command.action === "move") {
        const taskToMove =
          tasks.find((t) => t._id === command.taskId) ||
          tasks.find((t) =>
            t.title.toLowerCase().includes(command.taskTitle?.toLowerCase()),
          );

        if (taskToMove) {
          await updateTask(taskToMove._id, {
            status: command.status,
            assignedTo:
              taskToMove.assignedTo?._id || taskToMove.assignedTo || null,
          });
        } else {
          toast.error("Task not found");
        }
      } else if (command.action === "assign") {
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
    <div className="space-y-6">
      {/* Kanban Board - full width */}
      <KanbanBoard
        tasks={tasks}
        project={project}
        createTask={createTask}
        updateTask={updateTask}
        deleteTask={deleteTask}
        reorderColumn={reorderColumn}
        fetchTasks={fetchTasks}
        onProjectUpdated={setProject}
      />

      {/* AI Panels - side by side on large screens, stacked on mobile */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TaskAssistant onTaskAction={handleTaskAction} tasks={tasks} />
        <AgentActivityPanel />
      </div>
    </div>
  );
};
