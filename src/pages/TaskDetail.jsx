import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Link2,
  Trash2,
  ExternalLink,
  Bot,
  ChevronRight,
  Pencil,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { Button } from "../components/common/Button";
import { TaskModal } from "../components/tasks/TaskModal";
import {
  TypeIcon,
  PriorityIcon,
  StatusLozenge,
  Avatar,
  DueDateChip,
} from "../components/common/TaskIcons";
import { AGENT_STATUS_LABELS, TASK_STATUS } from "../utils/constants";
import { formatDateTime } from "../utils/helpers";

const fieldClass =
  "w-full px-2.5 py-1.5 bg-white border border-line rounded text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors";

const toDateInput = (d) => (d ? String(d).slice(0, 10) : "");

export const TaskDetail = () => {
  const { key } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchTask = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/tasks/key/${key}`);
      setTask(data);
      setNotFound(false);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    setLoading(true);
    fetchTask();
  }, [fetchTask]);

  useEffect(() => {
    api
      .get("/api/users/team")
      .then(({ data }) => setTeamMembers(data))
      .catch(() => {});
  }, []);

  // Save one or more fields, then refetch so populated fields stay intact
  const save = async (fields) => {
    try {
      await api.put(`/api/tasks/${task._id}`, fields);
      await fetchTask();
      toast.success("Updated");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${task.key}? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/tasks/${task._id}`);
      toast.success("Task deleted");
      navigate(`/tasks?projectId=${task.projectId?._id || ""}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-line border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="bg-white rounded-lg border border-line p-12 text-center">
        <h2 className="text-lg font-semibold text-ink mb-1">Task not found</h2>
        <p className="text-sm text-ink-subtle mb-6">
          {key} doesn't exist or you don't have access to it.
        </p>
        <Link to="/projects">
          <Button variant="secondary">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  const agentStatus = task.agentJobId?.status;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-ink-subtle mb-4 flex-wrap">
        <Link to="/projects" className="hover:text-brand hover:underline">
          Projects
        </Link>
        <ChevronRight size={14} />
        <Link
          to={`/tasks?projectId=${task.projectId?._id || ""}`}
          className="hover:text-brand hover:underline"
        >
          {task.projectId?.name || "Project"}
        </Link>
        <ChevronRight size={14} />
        <span className="font-medium text-ink">{task.key}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-line p-6">
            {/* Key + actions */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TypeIcon type={task.type} size={16} />
                <span className="text-sm font-medium text-ink-subtle">
                  {task.key}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={copyLink}
                  title="Copy link"
                  className="p-1.5 hover:bg-gray-100 rounded text-ink-subtle transition-colors"
                >
                  <Link2 size={15} />
                </button>
                <button
                  onClick={() => setIsEditOpen(true)}
                  title="Edit"
                  className="p-1.5 hover:bg-gray-100 rounded text-ink-subtle transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={handleDelete}
                  title="Delete"
                  className="p-1.5 hover:bg-danger-tint hover:text-danger rounded text-ink-subtle transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <h1 className="text-xl font-semibold text-ink mb-4 leading-snug">
              {task.title}
            </h1>

            {/* Description */}
            <div className="mb-5">
              <h3 className="text-xs font-bold text-ink-subtle uppercase tracking-wide mb-2">
                Description
              </h3>
              {task.description ? (
                <p className="text-sm text-ink whitespace-pre-line leading-relaxed">
                  {task.description}
                </p>
              ) : (
                <p className="text-sm text-ink-subtle italic">
                  No description added.
                </p>
              )}
            </div>

            {/* Acceptance criteria */}
            {task.acceptanceCriteria && (
              <div>
                <h3 className="text-xs font-bold text-ink-subtle uppercase tracking-wide mb-2">
                  Acceptance criteria
                </h3>
                <p className="text-sm text-ink whitespace-pre-line leading-relaxed">
                  {task.acceptanceCriteria}
                </p>
              </div>
            )}
          </div>

          {/* AI agent box */}
          {(task.assignedToAI || task.prLink || agentStatus) && (
            <div className="bg-white rounded-lg border border-line p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-brand-tint rounded flex items-center justify-center">
                  <Bot size={15} className="text-brand" />
                </div>
                <h3 className="text-sm font-semibold text-ink">AI Agent</h3>
                {agentStatus && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-tint text-brand">
                    {AGENT_STATUS_LABELS[agentStatus] || agentStatus}
                  </span>
                )}
              </div>
              {task.repoUrl && (
                <p className="text-xs text-ink-subtle mb-2 break-all">
                  Repository: {task.repoUrl}
                </p>
              )}
              {task.prLink && (
                <a
                  href={task.prLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline font-medium"
                >
                  <ExternalLink size={14} /> View Pull Request
                </a>
              )}
            </div>
          )}
        </div>

        {/* Details sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-line p-5 space-y-4">
            <h3 className="text-xs font-bold text-ink-subtle uppercase tracking-wide">
              Details
            </h3>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-ink-subtle mb-1.5">
                Status
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={task.status}
                  onChange={(e) => save({ status: e.target.value })}
                  className={fieldClass}
                >
                  <option value={TASK_STATUS.TODO}>To Do</option>
                  <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
                  <option value={TASK_STATUS.IN_REVIEW}>In Review</option>
                  <option value={TASK_STATUS.DONE}>Done</option>
                </select>
                <StatusLozenge status={task.status} />
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-xs font-semibold text-ink-subtle mb-1.5">
                Assignee
              </label>
              <select
                value={task.assignedTo?._id || ""}
                onChange={(e) => save({ assignedTo: e.target.value })}
                className={fieldClass}
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reporter */}
            <div>
              <label className="block text-xs font-semibold text-ink-subtle mb-1.5">
                Reporter
              </label>
              {task.reporter ? (
                <div className="flex items-center gap-2">
                  <Avatar name={task.reporter.name} size="sm" />
                  <span className="text-sm text-ink">{task.reporter.name}</span>
                </div>
              ) : (
                <span className="text-sm text-ink-subtle italic">Unknown</span>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-ink-subtle mb-1.5">
                Priority
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={task.priority}
                  onChange={(e) => save({ priority: e.target.value })}
                  className={fieldClass}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <PriorityIcon priority={task.priority} size={16} />
              </div>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-xs font-semibold text-ink-subtle mb-1.5">
                Start date
              </label>
              <input
                type="date"
                value={toDateInput(task.startDate)}
                onChange={(e) => save({ startDate: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-subtle mb-1.5">
                Due date
              </label>
              <input
                type="date"
                value={toDateInput(task.dueDate)}
                onChange={(e) => save({ dueDate: e.target.value })}
                className={fieldClass}
              />
              {task.dueDate && (
                <div className="mt-1.5">
                  <DueDateChip
                    dueDate={task.dueDate}
                    status={task.status}
                    size="sm"
                  />
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="pt-3 border-t border-line space-y-1">
              <p className="text-[11px] text-ink-subtle">
                Created {formatDateTime(task.createdAt)}
              </p>
              <p className="text-[11px] text-ink-subtle">
                Updated {formatDateTime(task.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full edit modal */}
      <TaskModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={async (data) => {
          await save(data);
        }}
        task={task}
      />
    </div>
  );
};
