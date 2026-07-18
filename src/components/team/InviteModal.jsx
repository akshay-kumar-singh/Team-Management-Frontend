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
      const { data } = await api.post("/api/users/invite", formData);
      if (data.emailSent === false) {
        // Dev fallback: SMTP failed but the invite exists — link is in the backend terminal
        toast(data.message, { icon: "⚠️", duration: 8000 });
      } else {
        toast.success("Invitation sent successfully!");
      }
      onClose();
      setFormData({ email: "", role: USER_ROLES.MEMBER });
    } catch (error) {
      // api interceptor rejects with a plain Error carrying the server message
      toast.error(error.message || "Failed to send invitation");
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
        />
        
        <div className="mb-4">
          <label className="block text-xs font-semibold text-ink-subtle mb-1.5">
            Workspace Role
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-line rounded text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
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
