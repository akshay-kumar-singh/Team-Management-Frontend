import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Check } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { TypeIcon, StatusLozenge, Avatar, ProgressBar } from "../common/TaskIcons";

/**
 * Detail-page section for a task's children:
 *  - normal task → its subtasks (checkable, with add + roll-up progress)
 *  - epic       → the issues linked to it (read-only roll-up)
 */
export const TaskChildren = ({ task, onChanged }) => {
  const isEpic = task.type === "epic";
  const isSubtask = Boolean(task.parentId);
  const [subtasks, setSubtasks] = useState([]);
  const [epicChildren, setEpicChildren] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/tasks/${task._id}/children`);
      setSubtasks(data.subtasks || []);
      setEpicChildren(data.epicChildren || []);
    } catch {
      /* silent — section just stays empty */
    }
  }, [task._id]);

  useEffect(() => {
    load();
  }, [load, task.updatedAt]);

  const addSubtask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      await api.post(`/api/tasks/${task._id}/subtasks`, { title: newTitle.trim() });
      setNewTitle("");
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  const toggleDone = async (sub) => {
    const next = sub.status === "done" ? "todo" : "done";
    try {
      await api.put(`/api/tasks/${sub._id}`, { status: next });
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const removeSubtask = async (sub) => {
    if (!window.confirm(`Delete subtask ${sub.key}?`)) return;
    try {
      await api.delete(`/api/tasks/${sub._id}`);
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Subtasks can't have their own children
  if (isSubtask) return null;

  const items = isEpic ? epicChildren : subtasks;
  const done = items.filter((t) => t.status === "done").length;

  return (
    <div className="bg-white rounded-lg border border-line p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-ink">
          {isEpic ? "Child issues" : "Subtasks"}
        </h3>
        {items.length > 0 && (
          <span className="text-xs text-ink-subtle font-medium">
            {done}/{items.length}
          </span>
        )}
      </div>

      {items.length > 0 && (
        <ProgressBar done={done} total={items.length} className="mb-3" />
      )}

      <div className="space-y-1">
        {items.map((child) => (
          <div
            key={child._id}
            className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-canvas group"
          >
            {isEpic ? (
              <TypeIcon type={child.type} />
            ) : (
              <button
                onClick={() => toggleDone(child)}
                title={child.status === "done" ? "Mark as to do" : "Mark as done"}
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                  child.status === "done"
                    ? "bg-success border-success text-white"
                    : "border-line hover:border-brand"
                }`}
              >
                {child.status === "done" && <Check size={11} />}
              </button>
            )}

            <Link
              to={`/browse/${child.key}`}
              className="text-[11px] font-semibold text-ink-subtle hover:text-brand flex-shrink-0"
            >
              {child.key}
            </Link>

            <span
              className={`text-sm flex-1 truncate ${
                child.status === "done" ? "line-through text-ink-subtle" : "text-ink"
              }`}
            >
              {child.title}
            </span>

            {isEpic && <StatusLozenge status={child.status} />}
            {child.assignedTo && <Avatar name={child.assignedTo.name} size="xs" />}

            {!isEpic && (
              <button
                onClick={() => removeSubtask(child)}
                title="Delete subtask"
                className="p-1 rounded text-ink-subtle hover:text-danger hover:bg-danger-tint opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-xs text-ink-subtle italic py-1">
            {isEpic
              ? "No issues in this epic yet — link one from any issue's Epic field."
              : "No subtasks yet."}
          </p>
        )}
      </div>

      {!isEpic && (
        <form onSubmit={addSubtask} className="flex items-center gap-2 mt-3">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a subtask..."
            className="flex-1 px-2.5 py-1.5 bg-white border border-line rounded text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
          <button
            type="submit"
            disabled={adding || !newTitle.trim()}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-brand text-white rounded text-xs font-medium hover:bg-brand-hover disabled:opacity-50"
          >
            <Plus size={13} /> Add
          </button>
        </form>
      )}
    </div>
  );
};
