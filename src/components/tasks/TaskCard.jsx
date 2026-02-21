import { Draggable } from "@hello-pangea/dnd";
import { Edit, Trash2, User, Clock } from "lucide-react";
import { truncateText, formatDateTime } from "../../utils/helpers";

export const TaskCard = ({ task, index, onEdit, onDelete }) => {
  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white p-4 rounded-xl shadow-md mb-3 hover:shadow-lg transition-all duration-300 border border-gray-200 ${
            snapshot.isDragging ? "rotate-3 scale-105" : ""
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-gray-900 flex-1">{task.title}</h4>
            <div className="w-2 h-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              {truncateText(task.description, 80)}
            </p>
          )}

          {task.assignedTo && (
            <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
              <User size={14} />
              <span>{task.assignedTo.name}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={14} />
              <span>{formatDateTime(task.createdAt)}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors text-purple-600"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
