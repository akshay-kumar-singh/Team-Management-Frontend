import { getInitials } from "../../utils/helpers";
import { Mail, Shield, UserCheck } from "lucide-react";

export const MemberCard = ({ member }) => {
  const roleBgColors = {
    ADMIN: "bg-danger-tint text-danger",
    MANAGER: "bg-brand-tint text-brand",
    MEMBER: "bg-success-tint text-success",
  };

  return (
    <div className="bg-white rounded-lg border border-line p-5 hover:shadow-md transition-shadow duration-150">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center text-white font-bold text-base">
          {getInitials(member.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-ink mb-0.5 truncate">
            {member.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-ink-subtle mb-3">
            <Mail size={12} />
            <span className="truncate">{member.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                roleBgColors[member.role]
              } flex items-center gap-1`}
            >
              <Shield size={11} />
              {member.role}
            </span>
            <span className="px-2 py-0.5 bg-success-tint text-success rounded text-[10px] font-bold tracking-wide flex items-center gap-1">
              <UserCheck size={11} />
              ACTIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
