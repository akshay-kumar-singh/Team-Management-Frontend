import { Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "./TaskCard";

export const Column = ({ column, tasks, onEditTask, onDeleteTask }) => {
  return (
    <div className="bg-column rounded-md p-2 min-h-[400px] flex flex-col">
      <div className="flex items-center gap-2 px-2 py-2 mb-1">
        <h3 className="text-[11px] font-bold text-ink-subtle uppercase tracking-wide">
          {column.title}
        </h3>
        <span className="text-[11px] font-semibold text-ink-subtle bg-gray-200 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[320px] rounded transition-colors duration-150 px-1 pb-1 ${
              snapshot.isDraggingOver ? "bg-brand-tint" : ""
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
