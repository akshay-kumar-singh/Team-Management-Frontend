import { Draggable } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, ExternalLink, Bot, Zap } from "lucide-react";
import {
  TypeIcon,
  PriorityIcon,
  Avatar,
  DueDateChip,
  LabelChip,
  StoryPoints,
  ProgressBar,
} from "../common/TaskIcons";
import { AGENT_STATUS_LABELS } from "../../utils/constants";

export const TaskCard = ({ task, index, onEdit, onDelete, epicProgress, isDone }) => {
  const navigate = useNavigate();
  const agentStatus = task.agentJobId?.status;
  const isEpic = task.type === "epic";
  const labels = task.labels || [];

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
          className={`group bg-white p-3 rounded border border-line mb-2 shadow-sm hover:bg-gray-50 transition-colors duration-150 cursor-pointer flex flex-col h-[168px] ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-brand/40 rotate-1" : ""
          }`}
        >
          {/* Content area — clips overflow so every card is exactly the same
              height; the footer below stays pinned and always visible. */}
          <div className="flex-1 min-h-0 overflow-hidden">
          {/* Epic link chip (for issues that belong to an epic) */}
          {task.epicId?.key && !isEpic && (
            <div className="mb-1.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700">
                <Zap size={9} /> {task.epicId.key}
              </span>
            </div>
          )}

          {/* Title + hover actions */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm text-ink leading-snug flex-1 group-hover:text-brand line-clamp-2">
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

          {/* Epic roll-up progress */}
          {isEpic && epicProgress && (
            <ProgressBar
              done={epicProgress.done}
              total={epicProgress.total}
              className="mb-2"
            />
          )}

          {/* Labels */}
          {labels.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mb-2">
              {labels.slice(0, 2).map((label) => (
                <LabelChip key={label} label={label} />
              ))}
              {labels.length > 2 && (
                <span className="text-[10px] text-ink-subtle font-medium">
                  +{labels.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Badges row: due date, AI, agent status, PR */}
          {(task.dueDate || task.assignedToAI || (agentStatus && agentStatus !== "completed") || task.prLink) && (
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <DueDateChip dueDate={task.dueDate} isDone={isDone} />
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

          </div>

          {/* Footer: type + key · priority + avatar — fixed at the bottom so
              every card is exactly the same height regardless of content */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <TypeIcon type={task.type} />
              {task.key && (
                <span className="text-[11px] font-medium text-ink-subtle truncate">
                  {task.key}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <StoryPoints points={task.storyPoints} />
              <PriorityIcon priority={task.priority} />
              {task.assignedTo && <Avatar name={task.assignedTo.name} size="xs" />}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
