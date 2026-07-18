import { Draggable } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, ExternalLink, Bot, Zap } from "lucide-react";
import {
  TypeIcon,
  PriorityIcon,
  Avatar,
  DueDateChip,
} from "../common/TaskIcons";
import { AGENT_STATUS_LABELS } from "../../utils/constants";

export const TaskCard = ({ task, index, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const agentStatus = task.agentJobId?.status;

  const openDetail = () => {
    if (task.key) navigate(`/browse/${task.key}`);
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={openDetail}
          className={`group bg-white p-3 rounded border border-line mb-2 shadow-sm hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-brand/40 rotate-1" : ""
          }`}
        >
          {/* Title + hover actions */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm text-ink leading-snug flex-1 group-hover:text-brand">
              {task.title}
            </h4>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                title="Edit"
                className="p-1 hover:bg-gray-200 rounded text-ink-subtle"
              >
                <Edit size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task._id);
                }}
                title="Delete"
                className="p-1 hover:bg-danger-tint rounded text-ink-subtle hover:text-danger"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Badges row: due date, AI, agent status, PR */}
          {(task.dueDate || task.assignedToAI || (agentStatus && agentStatus !== "completed") || task.prLink) && (
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <DueDateChip dueDate={task.dueDate} status={task.status} />
              {task.assignedToAI && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                  <Bot size={10} /> AI
                </span>
              )}
              {agentStatus && agentStatus !== "completed" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-tint text-brand">
                  <Zap size={10} />
                  {AGENT_STATUS_LABELS[agentStatus] || agentStatus}
                </span>
              )}
              {task.prLink && (
                <a
                  href={task.prLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-ink-subtle hover:text-brand"
                >
                  <ExternalLink size={10} /> PR
                </a>
              )}
            </div>
          )}

          {/* Footer: type + key ... priority + avatar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <TypeIcon type={task.type} />
              {task.key && (
                <span className="text-[11px] font-medium text-ink-subtle truncate">
                  {task.key}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <PriorityIcon priority={task.priority} />
              {task.assignedTo && <Avatar name={task.assignedTo.name} size="xs" />}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
