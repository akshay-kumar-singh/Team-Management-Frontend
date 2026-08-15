import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Plus, Play, CheckCircle2, Trash2, Target } from "lucide-react";
import { BacklogIssueRow } from "./BacklogIssueRow";
import { Button } from "../common/Button";

/**
 * One droppable container on the backlog page — a sprint or the backlog itself.
 */
export const SprintSection = ({
  sprint, // null for the backlog
  droppableId,
  tasks,
  points,
  doneCount,
  statusName,
  onStart,
  onComplete,
  onDelete,
  onQuickAdd,
}) => {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const isBacklog = !sprint;
  const isActive = sprint?.status === "active";

  const submitAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onQuickAdd(title.trim(), sprint?._id || null);
    setTitle("");
  };

  return (
    <div className={`rounded-lg border mb-4 ${isActive ? "border-brand" : "border-line"}`}>
      {/* Header */}
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg ${isActive ? "bg-brand-tint" : "bg-canvas"}`}>
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-ink truncate">
            {isBacklog ? "Backlog" : sprint.name}
          </h3>
          {isActive && (
            <span className="text-[10px] font-bold uppercase bg-success-tint text-success px-1.5 py-0.5 rounded">
              Active
            </span>
          )}
          {sprint?.goal && (
            <span className="hidden md:inline-flex items-center gap-1 text-xs text-ink-subtle">
              <Target size={12} /> {sprint.goal}
            </span>
          )}
          <span className="text-xs text-ink-subtle">
            {tasks.length} {tasks.length === 1 ? "issue" : "issues"}
            {points > 0 && ` · ${points} pts`}
            {isActive && ` · ${doneCount}/${tasks.length} done`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {sprint?.status === "future" && (
            <>
              <Button variant="outline" onClick={() => onStart(sprint)} disabled={tasks.length === 0}>
                <Play size={13} className="mr-1" /> Start
              </Button>
              <button
                onClick={() => onDelete(sprint)}
                title="Delete sprint"
                className="p-1.5 rounded text-ink-subtle hover:text-danger hover:bg-danger-tint"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
          {isActive && (
            <Button onClick={() => onComplete(sprint)}>
              <CheckCircle2 size={13} className="mr-1" /> Complete sprint
            </Button>
          )}
        </div>
      </div>

      {/* Droppable issue list */}
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-2 min-h-[56px] rounded-b-lg transition-colors ${
              snapshot.isDraggingOver ? "bg-brand-tint" : ""
            }`}
          >
            {tasks.map((task, index) => (
              <BacklogIssueRow key={task._id} task={task} index={index} statusName={statusName} />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <p className="text-xs text-ink-subtle italic text-center py-3">
                {isBacklog ? "Backlog is empty" : "Drag issues here to plan this sprint"}
              </p>
            )}

            {/* Quick add */}
            {adding ? (
              <form onSubmit={submitAdd} className="mt-1">
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => !title.trim() && setAdding(false)}
                  placeholder="What needs to be done?"
                  className="w-full px-3 py-2 border border-brand rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </form>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="mt-1 inline-flex items-center gap-1 text-xs text-ink-subtle hover:text-brand font-medium px-2 py-1"
              >
                <Plus size={13} /> Create issue
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
