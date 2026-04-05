import { Draggable } from "@hello-pangea/dnd";
import { Edit, Trash2, User, Clock, ExternalLink, Bot, Zap } from "lucide-react";
import { truncateText, formatDateTime } from "../../utils/helpers";
import { PRIORITY_COLORS, TYPE_ICONS, AGENT_STATUS_LABELS } from "../../utils/constants";

export const TaskCard = ({ task, index, onEdit, onDelete }) => {
  const priorityClass = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
  const typeIcon = TYPE_ICONS[task.type] || TYPE_ICONS.task;
  const agentStatus = task.agentJobId?.status;

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white p-4 rounded-xl shadow-md mb-3 hover:shadow-lg transition-all duration-300 border border-gray-200 ${
            snapshot.isDragging ? "rotate-3 scale-105" : ""
          } ${task.assignedToAI ? "ring-2 ring-purple-300 ring-opacity-50" : ""}`}
        >
          {/* Header: type icon + title + AI badge */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-2 flex-1">
              <span className="text-sm mt-0.5">{typeIcon}</span>
              <h4 className="font-semibold text-gray-900 flex-1 text-sm leading-tight">{task.title}</h4>
            </div>
            {task.assignedToAI && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-purple-100 to-pink-100 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                <Bot size={12} className="text-purple-600" />
                <span className="text-[10px] font-bold text-purple-600">AI</span>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-500 mb-2 leading-relaxed">
              {truncateText(task.description, 80)}
            </p>
          )}

          {/* Priority badge */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${priorityClass}`}>
              {task.priority?.toUpperCase() || "MEDIUM"}
            </span>

            {/* Agent status badge */}
            {agentStatus && agentStatus !== "completed" && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
                <Zap size={10} />
                {AGENT_STATUS_LABELS[agentStatus] || agentStatus}
              </span>
            )}
          </div>

          {/* PR Link */}
          {task.prLink && (
            <a
              href={task.prLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 mb-2 bg-purple-50 px-2 py-1 rounded-lg transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={12} />
              <span className="font-medium">View Pull Request</span>
            </a>
          )}

          {/* Assigned To */}
          {task.assignedTo && (
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
              <User size={12} />
              <span>{task.assignedTo.name}</span>
            </div>
          )}

          {/* Footer: date + actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Clock size={11} />
              <span>{formatDateTime(task.createdAt)}</span>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors text-purple-600"
              >
                <Edit size={13} />
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors text-red-600"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
