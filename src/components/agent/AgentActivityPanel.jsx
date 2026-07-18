import { useEffect, useState } from "react";
import { Bot, CheckCircle, XCircle, Loader, GitBranch, ExternalLink, Clock, Trash2 } from "lucide-react";
import { AGENT_STATUS_LABELS } from "../../utils/constants";
import { useAgent } from "../../hooks/useAgent";

const STEP_ORDER = ["queued", "cloning", "analyzing", "coding", "pushing", "creating-pr", "completed"];

const StepIndicator = ({ currentStatus }) => {
  const currentIdx = currentStatus === "revising" ? STEP_ORDER.indexOf("analyzing") : STEP_ORDER.indexOf(currentStatus);
  const isFailed = currentStatus === "failed";

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {STEP_ORDER.map((step, idx) => {
        const isActive = idx === currentIdx;
        const isDone = idx < currentIdx;
        const label = AGENT_STATUS_LABELS[step] || step;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center min-w-[60px]">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isDone
                    ? "bg-success text-white"
                    : isActive && !isFailed
                    ? "bg-brand text-white animate-pulse"
                    : isActive && isFailed
                    ? "bg-danger text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {isDone ? "✓" : idx + 1}
              </div>
              <span className={`text-[9px] mt-1 text-center leading-tight ${
                isActive ? "text-brand font-bold" : isDone ? "text-success" : "text-gray-400"
              }`}>
                {label.replace(/^[^\s]+\s?/, "")}
              </span>
            </div>
            {idx < STEP_ORDER.length - 1 && (
              <div className={`w-4 h-0.5 mt-[-12px] ${
                isDone ? "bg-success" : "bg-gray-200"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const AgentActivityPanel = () => {
  const { jobs, fetchJobs, deleteJob, loading } = useAgent();
  const [expandedJob, setExpandedJob] = useState(null);

  const handleDelete = async (e, jobId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this agent job?")) {
      try {
        await deleteJob(jobId);
      } catch {
        alert("Failed to delete job");
      }
    }
  };

  useEffect(() => {
    fetchJobs();
    // Silent background poll as a fallback — live updates arrive via socket
    const interval = setInterval(() => fetchJobs({ silent: true }), 15000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const activeJobs = jobs.filter((j) => !["completed", "failed"].includes(j.status));
  const recentJobs = jobs.filter((j) => ["completed", "failed"].includes(j.status)).slice(0, 5);

  return (
    <div className="bg-white rounded-lg border border-line p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-brand-tint rounded flex items-center justify-center">
          <Bot className="text-brand" size={18} />
        </div>
        <div>
          <h3 className="font-semibold text-ink text-sm">AI Agent Activity</h3>
          <p className="text-xs text-ink-subtle">
            {activeJobs.length > 0
              ? `${activeJobs.length} job(s) in progress`
              : "No active jobs"}
          </p>
        </div>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div className="space-y-3 mb-4">
          {activeJobs.map((job) => (
            <div
              key={job._id}
              className="bg-canvas rounded p-3 border border-line"
            >
              <div className="flex items-center gap-2 mb-2">
                <Loader size={14} className="text-brand animate-spin" />
                <span className="text-sm font-medium text-ink truncate flex-1">
                  {job.taskId?.title || "Unknown task"}
                </span>
                <button
                  onClick={(e) => handleDelete(e, job._id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete Job"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <StepIndicator currentStatus={job.status} />
              {job.branch && (
                <div className="flex items-center gap-1 text-xs text-ink-subtle mt-1">
                  <GitBranch size={11} />
                  <span className="truncate">{job.branch}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recent Jobs */}
      {recentJobs.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-ink-subtle uppercase tracking-wide mb-2">Recent</h4>
          <div className="space-y-2">
            {recentJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded p-2.5 border border-line cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedJob(expandedJob === job._id ? null : job._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {job.status === "completed" ? (
                      <CheckCircle size={14} className="text-success" />
                    ) : (
                      <XCircle size={14} className="text-danger" />
                    )}
                    <span className="text-xs font-medium text-ink truncate max-w-[180px]">
                      {job.taskId?.title || "Unknown task"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.prUrl && (
                      <a
                        href={job.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand hover:text-brand-hover"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, job._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete Job"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Expanded logs */}
                {expandedJob === job._id && job.logs && (
                  <div className="mt-2 max-h-32 overflow-y-auto">
                    {job.logs.slice(-8).map((log, idx) => (
                      <div key={idx} className="text-[10px] text-ink-subtle py-0.5 flex gap-1">
                        <Clock size={9} className="mt-0.5 flex-shrink-0" />
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {jobs.length === 0 && !loading && (
        <div className="text-center py-6 text-ink-subtle">
          <Bot size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-xs">No agent jobs yet.</p>
          <p className="text-xs">Create a task with "Assign to AI" to get started!</p>
        </div>
      )}
    </div>
  );
};
