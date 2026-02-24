import { useState, useEffect } from "react";
import { MemberCard } from "./MemberCard";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Users } from "lucide-react";

export const TeamOverview = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <Users size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600">{members.length} members in your team</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <MemberCard key={member._id} member={member} />
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-2xl">
          <Users size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">No team members found</p>
          <p className="text-sm mt-2">Invite others to join your team!</p>
        </div>
      )}
    </div>
  );
};
