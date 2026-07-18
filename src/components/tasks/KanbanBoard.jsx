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
      <div className="bg-white rounded-lg p-12 border border-line text-center">
        <LayoutGrid size={40} className="mx-auto mb-4 text-ink-subtle opacity-40" />
        <h3 className="text-base font-semibold text-ink mb-1">No project selected</h3>
        <p className="text-ink-subtle text-sm">
          Go to <span className="font-medium text-brand">Projects</span> and click a project to view its board.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">Board</h1>
          <p className="text-xs text-ink-subtle mt-0.5">{tasks.length} issues</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} className="mr-1" /> Create
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
