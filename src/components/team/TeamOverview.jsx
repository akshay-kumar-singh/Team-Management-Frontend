import { useState, useEffect } from "react";
import { MemberCard } from "./MemberCard";
import { InviteModal } from "./InviteModal";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Users, UserPlus } from "lucide-react";

export const TeamOverview = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  const { userData } = useAuth();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data } = await api.get("/api/users/team");
      setMembers(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-line border-t-brand"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-tint rounded flex items-center justify-center">
            <Users size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-ink">Team Members</h1>
            <p className="text-xs text-ink-subtle">{members.length} members in your workspace</p>
          </div>
        </div>

        {userData?.role === "ADMIN" && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white px-3 py-1.5 rounded transition-colors font-medium text-sm"
          >
            <UserPlus size={16} />
            Invite Member
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <MemberCard key={member._id} member={member} />
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center text-ink-subtle py-12 bg-white border border-line rounded-lg">
          <Users size={40} className="mx-auto mb-4 text-ink-subtle opacity-40" />
          <p className="text-base font-medium text-ink">No team members found</p>
          <p className="text-sm mt-2">Invite others to join your workspace!</p>
        </div>
      )}

      <InviteModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
      />
    </div>
  );
};
