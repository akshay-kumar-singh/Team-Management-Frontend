import { useState } from "react";
import { Plus } from "lucide-react";
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
  const { projects, loading, createProject, updateProject, deleteProject } =
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        {canCreate && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={20} className="mr-2" /> New Project
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
        <div className="text-center text-gray-500 py-12">
          No projects yet. Create your first project!
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
