import { Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "./TaskCard";

export const Column = ({
  column,
  tasks,
  droppableId,
  onEditTask,
  onDeleteTask,
  epicProgressMap = {},
  doneStatus,
}) => {
  const limit = column.wipLimit;
  const overLimit = limit != null && tasks.length > limit;

  return (
    <div
      className={`rounded-md p-2 min-h-[400px] flex flex-col ${
        overLimit ? "bg-danger-tint" : "bg-column"
      }`}
    >
      <div className="flex items-center gap-2 px-2 py-2 mb-1">
        <h3 className="text-[11px] font-bold text-ink-subtle uppercase tracking-wide truncate">
          {column.name}
        </h3>
        <span
          title={limit != null ? `${tasks.length} of WIP limit ${limit}` : undefined}
          className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
            overLimit ? "bg-danger text-white" : "bg-gray-200 text-ink-subtle"
          }`}
        >
          {limit != null ? `${tasks.length}/${limit}` : tasks.length}
        </span>
        {overLimit && (
          <span className="text-[10px] font-semibold text-danger uppercase">Over limit</span>
        )}
      </div>

      <Droppable droppableId={droppableId || column.id}>
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
                epicProgress={epicProgressMap[task._id]}
                isDone={task.status === doneStatus}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
