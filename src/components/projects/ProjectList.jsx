import { useState } from "react";
import { Plus, Folder } from "lucide-react";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";
import { Button } from "../common/Button";
import { useProjects } from "../../hooks/useProjects";
import { useAuth } from "../../hooks/useAuth";
import { USER_ROLES } from "../../utils/constants";
import { useNavigate } from "react-router-dom";

export const ProjectList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const { projects, loading, createProject, updateProject, deleteProject, fetchProjects } =
    useProjects();
  const { userData } = useAuth();
  const navigate = useNavigate();

  const canCreate =
    userData?.role === USER_ROLES.ADMIN ||
    userData?.role === USER_ROLES.MANAGER;

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
    if (window.confirm("Are you sure you want to delete this project?")) {
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
        {canCreate && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={16} className="mr-1" /> Create project
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
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
