import { useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { Column } from "./Column";
import { TaskModal } from "./TaskModal";
import { Button } from "../common/Button";
import { TASK_COLUMNS } from "../../utils/constants";
import { useSearchParams } from "react-router-dom";

export const KanbanBoard = ({ tasks = [], createTask, updateTask, deleteTask }) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const task = tasks.find((t) => t._id === draggableId);

    if (task && task.status !== destination.droppableId) {
      // Always include existing assignedTo so it never gets wiped
      await updateTask(draggableId, {
        status: destination.droppableId,
        assignedTo: task.assignedTo?._id || task.assignedTo || null,
      });
    }
  };

  const handleSubmit = async (data) => {
    if (selectedTask) {
      await updateTask(selectedTask._id, data);
    } else {
      await createTask(data);
    }
    setSelectedTask(null);
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTask(id);
    }
  };

  if (!projectId) {
    return (
      <div className="text-center text-gray-500 py-12">
        Please select a project to view tasks
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Board</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" /> New Task
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TASK_COLUMNS.map((column) => (
            <Column
              key={column.id}
              column={column}
              tasks={tasks.filter((t) => t.status === column.id)}
              onEditTask={handleEdit}
              onDeleteTask={handleDelete}
            />
          ))}
        </div>
      </DragDropContext>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleSubmit}
        task={selectedTask}
      />
    </div>
  );
};
