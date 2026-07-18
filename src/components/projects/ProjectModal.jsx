import { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";

export const ProjectModal = ({ isOpen, onClose, onSubmit, project }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Re-sync every time the modal opens so a previous session's
  // typed-but-unsaved values never leak into a fresh form
  useEffect(() => {
    if (!isOpen) return;
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || "",
      });
    } else {
      setFormData({ name: "", description: "" });
    }
  }, [project, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? "Edit Project" : "Create New Project"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Project Name
          </label>
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter project name"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Enter project description"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
            rows="4"
          />
        </div>
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            {project ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
