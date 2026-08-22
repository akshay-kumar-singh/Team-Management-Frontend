import { Edit, Trash2, Calendar, CheckCircle2, Star } from "lucide-react";
import { USER_ROLES } from "../../utils/constants";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../../utils/helpers";

export const ProjectCard = ({ project, onEdit, onDelete, onClick }) => {
  const { userData, toggleStar } = useAuth();
  const canEdit =
    userData?.role === USER_ROLES.ADMIN ||
    userData?.role === USER_ROLES.MANAGER;
  const canDelete = userData?.role === USER_ROLES.ADMIN;
  const starred = (userData?.starredProjects || []).some((id) => id === project._id);

  const progress =
    project.total > 0
      ? Math.round((project.doneTasks / project.total) * 100)
      : 0;

  return (
    <div className="group bg-white rounded-lg border border-line p-5 hover:shadow-md transition-shadow duration-150 cursor-pointer">
      <div onClick={onClick} className="mb-4">
        <div className="flex items-start justify-between mb-3">
          {/* Project avatar from key */}
          <div className="w-10 h-10 bg-brand rounded flex items-center justify-center text-white font-bold text-sm">
            {(project.key || project.name || "P").slice(0, 2).toUpperCase()}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleStar("project", project._id);
              }}
              title={starred ? "Unstar" : "Star"}
              className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                starred ? "text-warn" : "text-ink-subtle opacity-0 group-hover:opacity-100"
              }`}
            >
              <Star size={15} fill={starred ? "currentColor" : "none"} />
            </button>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold tracking-wide rounded flex items-center gap-1 ${
                project.status === "Completed"
                  ? "bg-brand-tint text-brand"
                  : "bg-success-tint text-success"
              }`}
            >
              {project.status === "Completed" && <CheckCircle2 size={11} />}
              {(project.status || "Active").toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-semibold text-ink group-hover:text-brand transition-colors truncate">
            {project.name}
          </h3>
          {project.key && (
            <span className="text-[10px] font-bold text-ink-subtle bg-gray-100 border border-line px-1.5 py-0.5 rounded flex-shrink-0">
              {project.key}
            </span>
          )}
        </div>
        {project.description && (
          <p className="text-xs text-ink-subtle truncate">{project.description}</p>
        )}

        {project.total > 0 ? (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-ink-subtle mb-1">
              <span>Progress</span>
              <span>
                {project.doneTasks}/{project.total} issues
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-brand transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-ink-subtle mt-3 italic">No issues yet</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-line">
        <div className="flex items-center gap-1.5 text-ink-subtle text-xs">
          <Calendar size={13} />
          <span>{formatDate(project.createdAt)}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
              className="p-1.5 hover:bg-gray-100 rounded text-ink-subtle transition-colors"
            >
              <Edit size={14} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project._id);
              }}
              className="p-1.5 hover:bg-danger-tint hover:text-danger rounded text-ink-subtle transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
