import { Draggable } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import {
  TypeIcon,
  PriorityIcon,
  StatusLozenge,
  Avatar,
  StoryPoints,
} from "../common/TaskIcons";

export const BacklogIssueRow = ({ task, index, statusName }) => {
  const navigate = useNavigate();

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => task.key && navigate(`/browse/${task.key}`)}
          className={`flex items-center gap-2 bg-white border border-line rounded px-3 py-2 mb-1.5 cursor-pointer hover:bg-canvas transition-colors ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-brand/40" : ""
          }`}
        >
          <TypeIcon type={task.type} />
          <span className="text-[11px] font-semibold text-ink-subtle flex-shrink-0">{task.key}</span>
          <span className="text-sm text-ink flex-1 truncate">{task.title}</span>

          {task.epicId?.key && (
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700 flex-shrink-0">
              <Zap size={9} /> {task.epicId.key}
            </span>
          )}

          <StatusLozenge status={task.status} label={statusName(task.status)} className="hidden sm:inline-flex" />
          <StoryPoints points={task.storyPoints} />
          <PriorityIcon priority={task.priority} />
          {task.assignedTo && <Avatar name={task.assignedTo.name} size="xs" />}
        </div>
      )}
    </Draggable>
  );
};
