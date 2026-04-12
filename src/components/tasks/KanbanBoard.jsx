import { useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { Plus, LayoutGrid } from "lucide-react";
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
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-12 border border-purple-200 text-center">
        <LayoutGrid size={48} className="mx-auto mb-4 text-purple-300" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Project Selected</h3>
        <p className="text-gray-500 text-sm">
          Go to <span className="font-medium text-purple-600">Projects</span> and click a project to view its tasks.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
          <p className="text-sm text-gray-500 mt-1">{tasks.length} total tasks</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} className="mr-1.5" /> New Task
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Horizontally scrollable on mobile, grid on larger screens */}
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-4 gap-4 min-w-[720px]">
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
