import { useState } from "react";
import { Plus, Folder, Archive, RotateCcw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";
import { Button } from "../common/Button";
import { useProjects } from "../../hooks/useProjects";
import { useAuth } from "../../hooks/useAuth";
import { USER_ROLES } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export const ProjectList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const { projects, loading, createProject, updateProject, deleteProject, fetchProjects } =
    useProjects();
  const { userData } = useAuth();
  const navigate = useNavigate();

  const [showArchived, setShowArchived] = useState(false);
  const [archived, setArchived] = useState([]);

  const canCreate =
    userData?.role === USER_ROLES.ADMIN ||
    userData?.role === USER_ROLES.MANAGER;
  const isAdmin = userData?.role === USER_ROLES.ADMIN;

  const toggleArchived = async () => {
    const next = !showArchived;
    setShowArchived(next);
    if (next) {
      try {
        const { data } = await api.get("/api/projects?archived=true");
        setArchived(data);
      } catch {
        toast.error("Could not load archived projects");
      }
    }
  };

  const restore = async (project) => {
    try {
      await api.post(`/api/projects/${project._id}/restore`);
      setArchived((prev) => prev.filter((p) => p._id !== project._id));
      await fetchProjects();
      toast.success("Project restored");
    } catch {
      toast.error("Could not restore");
    }
  };

  const purge = async (project) => {
    if (!window.confirm(`Permanently delete "${project.name}" and ALL its issues? This cannot be undone.`))
      return;
    try {
      await api.delete(`/api/projects/${project._id}/purge`);
      setArchived((prev) => prev.filter((p) => p._id !== project._id));
      toast.success("Project permanently deleted");
    } catch {
      toast.error("Could not delete");
    }
  };

  // Starred projects float to the top
  const starred = new Set(userData?.starredProjects || []);
  const sortedProjects = [...projects].sort(
    (a, b) => (starred.has(b._id) ? 1 : 0) - (starred.has(a._id) ? 1 : 0)
  );

  const handleSubmit = async (data) => {
    if (selectedProject) {
      await updateProject(selectedProject._id, data);
    } else {
      await createProject(data);
      // Refetch to get proper task counts
      await fetchProjects();
    }
    setSelectedProject(null);
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Archive this project? It will be hidden but you can restore it later.")) {
      await deleteProject(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-line border-t-brand" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-ink">Projects</h1>
          <p className="text-xs text-ink-subtle mt-0.5">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={toggleArchived}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded border transition-colors ${
                showArchived
                  ? "border-brand text-brand bg-brand-tint"
                  : "border-line text-ink-subtle hover:bg-gray-50"
              }`}
            >
              <Archive size={15} /> Archived
            </button>
          )}
          {canCreate && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={16} className="mr-1" /> Create project
            </Button>
          )}
        </div>
      </div>

      {/* Archived projects (admin) */}
      {showArchived && (
        <div className="mb-6 bg-white border border-line rounded-lg p-4">
          <h2 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
            <Archive size={15} className="text-ink-subtle" /> Archived projects ({archived.length})
          </h2>
          {archived.length === 0 ? (
            <p className="text-xs text-ink-subtle italic">No archived projects.</p>
          ) : (
            <div className="divide-y divide-line">
              {archived.map((p) => (
                <div key={p._id} className="flex items-center gap-3 py-2.5">
                  <div className="w-8 h-8 bg-gray-200 text-ink-subtle rounded flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {(p.key || p.name || "P").slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm text-ink flex-1 truncate">{p.name}</span>
                  <button
                    onClick={() => restore(p)}
                    className="flex items-center gap-1 text-xs text-brand font-medium hover:underline"
                  >
                    <RotateCcw size={13} /> Restore
                  </button>
                  <button
                    onClick={() => purge(p)}
                    className="p-1.5 rounded text-ink-subtle hover:bg-danger-tint hover:text-danger transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProjects.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClick={() => navigate(`/tasks?projectId=${project._id}`)}
          />
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg border border-line">
          <Folder size={40} className="mx-auto mb-4 text-ink-subtle opacity-40" />
          <p className="text-base font-semibold text-ink">No projects yet</p>
          <p className="text-sm text-ink-subtle mt-1 mb-6">
            {canCreate
              ? "Create your first project to get started!"
              : "No projects have been created yet."}
          </p>
          {canCreate && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={16} className="mr-1" /> Create project
            </Button>
          )}
        </div>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={handleSubmit}
        project={selectedProject}
      />
    </div>
  );
};
