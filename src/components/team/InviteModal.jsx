import { useState } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { USER_ROLES } from "../../utils/constants";
import api from "../../services/api";
import toast from "react-hot-toast";

export const InviteModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: "",
    role: USER_ROLES.MEMBER,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/users/invite", formData);
      toast.success("Invitation dispatched successfully!");
      onClose();
      setFormData({ email: "", role: USER_ROLES.MEMBER });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite New Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="colleague@company.com"
          required
          variant="light"
        />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Workspace Role
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value={USER_ROLES.MEMBER}>Member (Standard Access)</option>
            <option value={USER_ROLES.MANAGER}>Manager (Can Edit Projects)</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Invitation"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
