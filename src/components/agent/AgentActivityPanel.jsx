import { useEffect, useState } from "react";
import { Bot, CheckCircle, XCircle, Loader, GitBranch, ExternalLink, Clock } from "lucide-react";
import { AGENT_STATUS_LABELS } from "../../utils/constants";
import { useAgent } from "../../hooks/useAgent";

const STEP_ORDER = ["queued", "cloning", "analyzing", "coding", "pushing", "creating-pr", "completed"];

const StepIndicator = ({ currentStatus }) => {
  const currentIdx = STEP_ORDER.indexOf(currentStatus);
  const isFailed = currentStatus === "failed";
  const isRevising = currentStatus === "revising";

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
                    ? "bg-green-500 text-white"
                    : isActive && !isFailed
                    ? "bg-purple-500 text-white animate-pulse"
                    : isActive && isFailed
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {isDone ? "✓" : idx + 1}
              </div>
              <span className={`text-[9px] mt-1 text-center leading-tight ${
                isActive ? "text-purple-700 font-bold" : isDone ? "text-green-600" : "text-gray-400"
              }`}>
                {label.replace(/^[^\s]+\s?/, "")}
              </span>
            </div>
            {idx < STEP_ORDER.length - 1 && (
              <div className={`w-4 h-0.5 mt-[-12px] ${
                isDone ? "bg-green-400" : "bg-gray-200"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const AgentActivityPanel = () => {
  const { jobs, fetchJobs, loading } = useAgent();
  const [expandedJob, setExpandedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000); // Poll every 5s for updates
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const activeJobs = jobs.filter((j) => !["completed", "failed"].includes(j.status));
  const recentJobs = jobs.filter((j) => ["completed", "failed"].includes(j.status)).slice(0, 5);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-5 border border-purple-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
          <Bot className="text-white" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">AI Agent Activity</h3>
          <p className="text-xs text-gray-500">
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
              className="bg-white rounded-xl p-3 border border-purple-200 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <Loader size={14} className="text-purple-500 animate-spin" />
                <span className="text-sm font-semibold text-gray-900 truncate">
                  {job.taskId?.title || "Unknown task"}
                </span>
              </div>
              <StepIndicator currentStatus={job.status} />
              {job.branch && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
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
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent</h4>
          <div className="space-y-2">
            {recentJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white/70 rounded-lg p-2.5 border border-gray-200 cursor-pointer hover:bg-white transition-colors"
                onClick={() => setExpandedJob(expandedJob === job._id ? null : job._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {job.status === "completed" ? (
                      <CheckCircle size={14} className="text-green-500" />
                    ) : (
                      <XCircle size={14} className="text-red-500" />
                    )}
                    <span className="text-xs font-medium text-gray-700 truncate max-w-[180px]">
                      {job.taskId?.title || "Unknown task"}
                    </span>
                  </div>
                  {job.prUrl && (
                    <a
                      href={job.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-500 hover:text-purple-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                {/* Expanded logs */}
                {expandedJob === job._id && job.logs && (
                  <div className="mt-2 max-h-32 overflow-y-auto">
                    {job.logs.slice(-8).map((log, idx) => (
                      <div key={idx} className="text-[10px] text-gray-500 py-0.5 flex gap-1">
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
        <div className="text-center py-6 text-gray-400">
          <Bot size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-xs">No agent jobs yet.</p>
          <p className="text-xs">Create a task with "Assign to AI" to get started!</p>
        </div>
      )}
    </div>
  );
};
