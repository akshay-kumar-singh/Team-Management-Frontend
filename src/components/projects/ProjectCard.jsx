import { Edit, Trash2, Users, Calendar } from "lucide-react";
import { truncateText } from "../../utils/helpers";
import { USER_ROLES } from "../../utils/constants";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../../utils/helpers";
import { CheckCircle2 } from "lucide-react";

export const ProjectCard = ({ project, onEdit, onDelete, onClick }) => {
  const { userData } = useAuth();
  const canEdit =
    userData?.role === USER_ROLES.ADMIN ||
    userData?.role === USER_ROLES.MANAGER;
  const canDelete = userData?.role === USER_ROLES.ADMIN;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:-translate-y-1 cursor-pointer group">
      <div onClick={onClick} className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
            <Users className="text-white" size={24} />
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${
              project.status === "Completed"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {project.status === "Completed" && <CheckCircle2 size={12} />}
            {project.status || "Active"}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
          {project.name}
        </h3>
        {project.total > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>
                {project.doneTasks}/{project.total} tasks
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  project.status === "Completed"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                    : "bg-gradient-to-r from-purple-500 to-pink-500"
                }`}
                style={{
                  width: `${Math.round((project.doneTasks / project.total) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
        {project.total === 0 && (
          <p className="text-xs text-gray-400 mt-2 italic">No tasks yet</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Calendar size={16} />
          <span>{formatDate(project.createdAt)}</span>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
              className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-purple-600"
            >
              <Edit size={18} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project._id);
              }}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
