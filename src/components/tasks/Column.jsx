import { Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "./TaskCard";

export const Column = ({ column, tasks, onEditTask, onDeleteTask }) => {
  const columnColors = {
    todo: "from-blue-500 to-cyan-500",
    "in-progress": "from-yellow-500 to-orange-500",
    done: "from-green-500 to-emerald-500",
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-4 min-h-[500px] border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full bg-gradient-to-br ${
              columnColors[column.id] || "from-gray-500 to-gray-600"
            }`}
          ></div>
          <h3 className="font-bold text-lg text-gray-900">{column.title}</h3>
          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[400px] transition-colors ${
              snapshot.isDraggingOver ? "bg-purple-50" : ""
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
