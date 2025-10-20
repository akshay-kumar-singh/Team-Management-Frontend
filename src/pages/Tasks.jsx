import { KanbanBoard } from "../components/tasks/KanbanBoard";
import { TaskAssistant } from "../components/assistant/TaskAssistant";
import { useTasks } from "../hooks/useTasks";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

export const Tasks = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const { tasks, createTask, updateTask } = useTasks(projectId);

  const handleTaskAction = async (command) => {
    try {
      if (command.action === "create") {
        await createTask({
          title: command.title,
          status: "todo",
        });
        toast.success("Task created successfully!");
      } else if (command.action === "move") {
        const taskToMove = tasks.find((t) =>
          t.title.toLowerCase().includes(command.taskTitle.toLowerCase())
        );

        if (taskToMove) {
          await updateTask(taskToMove._id, { status: command.status });
          toast.success(`Task moved to ${command.status}!`);
        } else {
          toast.error(`Task "${command.taskTitle}" not found`);
        }
      } else if (command.action === "assign") {
        toast.info("Assign functionality: Find task and user, then update");
      }
    } catch (error) {
      toast.error("Failed to process command");
    }
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <KanbanBoard />
      </div>
      <div className="w-96">
        <TaskAssistant onTaskAction={handleTaskAction} />
      </div>
    </div>
  );
};
