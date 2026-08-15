import { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { LabelChip } from "../common/TaskIcons";
import { TASK_STATUS, TASK_PRIORITY, TASK_TYPE } from "../../utils/constants";
import api from "../../services/api";
import { Bot, X } from "lucide-react";

const fieldClass =
  "w-full px-3 py-2 bg-white border border-line rounded text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors";
const labelClass = "block text-xs font-semibold text-ink-subtle mb-1.5";

// yyyy-MM-dd for <input type="date"> from an ISO string
const toDateInput = (d) => (d ? String(d).slice(0, 10) : "");

const EMPTY_FORM = {
  title: "",
  description: "",
  status: TASK_STATUS.TODO,
  assignedTo: "",
  priority: TASK_PRIORITY.MEDIUM,
  type: TASK_TYPE.TASK,
  acceptanceCriteria: "",
  assignedToAI: false,
  repoUrl: "",
  startDate: "",
  dueDate: "",
  labels: [],
  storyPoints: "",
  epicId: "",
};

export const TaskModal = ({ isOpen, onClose, onSubmit, task, epics = [] }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [teamMembers, setTeamMembers] = useState([]);
  const [labelInput, setLabelInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen]);

  const fetchTeamMembers = async () => {
    try {
      const { data } = await api.get("/api/users/team");
      setTeamMembers(data);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  // Re-sync every time the modal opens so a previous session's
  // typed-but-unsaved values never leak into a fresh form
  useEffect(() => {
    if (!isOpen) return;
    setLabelInput("");
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        status: task.status,
        assignedTo: task.assignedTo?._id || "",
        priority: task.priority || TASK_PRIORITY.MEDIUM,
        type: task.type || TASK_TYPE.TASK,
        acceptanceCriteria: task.acceptanceCriteria || "",
        assignedToAI: task.assignedToAI || false,
        repoUrl: task.repoUrl || "",
        startDate: toDateInput(task.startDate),
        dueDate: toDateInput(task.dueDate),
        labels: task.labels || [],
        storyPoints: task.storyPoints ?? "",
        epicId: task.epicId?._id || task.epicId || "",
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [task, isOpen]);

  const addLabel = (raw) => {
    const value = raw.trim().replace(/,$/, "");
    if (!value) return;
    if (!formData.labels.includes(value) && formData.labels.length < 20) {
      setFormData((f) => ({ ...f, labels: [...f.labels, value] }));
    }
    setLabelInput("");
  };

  const removeLabel = (label) =>
    setFormData((f) => ({ ...f, labels: f.labels.filter((l) => l !== label) }));

  const handleLabelKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addLabel(labelInput);
    } else if (e.key === "Backspace" && !labelInput && formData.labels.length) {
      removeLabel(formData.labels[formData.labels.length - 1]);
    }
  };

  // Epics can't nest under other epics; a task can't be its own epic
  const epicOptions = epics.filter((e) => e._id !== task?._id);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Fold any half-typed label into the list before saving
    const labels = labelInput.trim()
      ? [...new Set([...formData.labels, labelInput.trim()])]
      : formData.labels;
    onSubmit({ ...formData, labels });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? `Edit ${task.key || "task"}` : "Create issue"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className={labelClass}>
            Title <span className="text-danger">*</span>
          </label>
          <input
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="What needs to be done?"
            required
            className={fieldClass}
          />
        </div>

        {/* Type & Priority row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Type</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value,
                  // an epic can't belong to another epic
                  epicId: e.target.value === "epic" ? "" : formData.epicId,
                })
              }
              className={fieldClass}
            >
              <option value="task">Task</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
              <option value="epic">Epic</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Priority</label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className={fieldClass}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Start & Due date row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Start date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Due date</label>
            <input
              type="date"
              value={formData.dueDate}
              min={formData.startDate || undefined}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className={fieldClass}
            />
          </div>
        </div>

        {/* Story points & Epic row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Story points</label>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.storyPoints}
              onChange={(e) =>
                setFormData({ ...formData, storyPoints: e.target.value })
              }
              placeholder="e.g. 3"
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Epic</label>
            <select
              value={formData.epicId}
              onChange={(e) =>
                setFormData({ ...formData, epicId: e.target.value })
              }
              disabled={formData.type === "epic"}
              className={`${fieldClass} disabled:opacity-50`}
            >
              <option value="">None</option>
              {epicOptions.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.key ? `${e.key} · ${e.title}` : e.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Labels */}
        <div>
          <label className={labelClass}>Labels</label>
          <div className={`${fieldClass} flex flex-wrap items-center gap-1.5 min-h-[38px]`}>
            {formData.labels.map((label) => (
              <span key={label} className="inline-flex items-center gap-1">
                <LabelChip label={label} />
                <button
                  type="button"
                  onClick={() => removeLabel(label)}
                  className="text-ink-subtle hover:text-danger"
                  title="Remove label"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            <input
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={handleLabelKeyDown}
              onBlur={() => addLabel(labelInput)}
              placeholder={formData.labels.length ? "" : "Add labels (Enter or comma)"}
              className="flex-1 min-w-[100px] outline-none text-sm bg-transparent"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Add a description..."
            className={`${fieldClass} resize-none`}
            rows="3"
          />
        </div>

        {/* Acceptance Criteria */}
        <div>
          <label className={labelClass}>Acceptance criteria</label>
          <textarea
            value={formData.acceptanceCriteria}
            onChange={(e) =>
              setFormData({ ...formData, acceptanceCriteria: e.target.value })
            }
            placeholder="What needs to be true for this task to be considered done?"
            className={`${fieldClass} resize-none`}
            rows="2"
          />
        </div>

        {/* Status & Assign To row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className={fieldClass}
            >
              <option value={TASK_STATUS.TODO}>To Do</option>
              <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
              <option value={TASK_STATUS.IN_REVIEW}>In Review</option>
              <option value={TASK_STATUS.DONE}>Done</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Assignee</label>
            <select
              value={formData.assignedTo}
              onChange={(e) =>
                setFormData({ ...formData, assignedTo: e.target.value })
              }
              disabled={formData.assignedToAI}
              className={`${fieldClass} disabled:opacity-50`}
            >
              <option value="">Unassigned</option>
              {teamMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Agent Toggle */}
        <div className="bg-canvas border border-line rounded p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-tint rounded flex items-center justify-center">
                <Bot className="text-brand" size={18} />
              </div>
              <div>
                <h4 className="font-semibold text-ink text-sm">
                  Assign to AI Agent
                </h4>
                <p className="text-xs text-ink-subtle">
                  Let AI automatically code and create a PR
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.assignedToAI}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assignedToAI: e.target.checked,
                    assignedTo: e.target.checked ? "" : formData.assignedTo,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-10 h-[22px] bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-brand"></div>
            </label>
          </div>

          {/* Repo URL (shown when AI is toggled on) */}
          {formData.assignedToAI && (
            <div className="mt-3">
              <label className={labelClass}>GitHub repository URL</label>
              <input
                value={formData.repoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, repoUrl: e.target.value })
                }
                placeholder="e.g. https://github.com/username/repo"
                required={formData.assignedToAI}
                className={fieldClass}
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{task ? "Save" : "Create"}</Button>
        </div>
      </form>
    </Modal>
  );
};
