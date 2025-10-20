import { getInitials } from "../../utils/helpers";
import { Mail, Shield, UserCheck } from "lucide-react";

export const MemberCard = ({ member }) => {
  const roleColors = {
    ADMIN: "from-red-500 to-orange-500",
    MANAGER: "from-blue-500 to-cyan-500",
    MEMBER: "from-green-500 to-emerald-500",
  };

  const roleBgColors = {
    ADMIN: "bg-red-50 text-red-700 border-red-200",
    MANAGER: "bg-blue-50 text-blue-700 border-blue-200",
    MEMBER: "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:-translate-y-1 group">
      <div className="flex items-start gap-4">
        <div
          className={`w-16 h-16 bg-gradient-to-br ${
            roleColors[member.role]
          } rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform`}
        >
          {getInitials(member.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
            {member.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Mail size={14} />
            <span className="truncate">{member.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                roleBgColors[member.role]
              } flex items-center gap-1.5`}
            >
              <Shield size={14} />
              {member.role}
            </span>
            <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-green-200">
              <UserCheck size={14} />
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
