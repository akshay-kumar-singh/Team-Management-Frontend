import { getInitials } from "../../utils/helpers";
import { Mail, Shield, UserCheck, Trash2, Crown } from "lucide-react";

const roleBgColors = {
  ADMIN: "bg-danger-tint text-danger",
  MANAGER: "bg-brand-tint text-brand",
  MEMBER: "bg-success-tint text-success",
};

export const MemberCard = ({ member, canManage, isSelf, isOwner, onRoleChange, onRemove }) => {
  // Owners and yourself can't be role-changed/removed from here
  const manageable = canManage && !isSelf && !isOwner;

  return (
    <div className="bg-white rounded-lg border border-line p-5 hover:shadow-md transition-shadow duration-150">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0">
          {getInitials(member.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-ink mb-0.5 truncate flex items-center gap-1.5">
            {member.name}
            {isOwner && <Crown size={13} className="text-warn" title="Organization owner" />}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-ink-subtle mb-3">
            <Mail size={12} />
            <span className="truncate">{member.email}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
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

          {manageable && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-line">
              <select
                value={member.role}
                onChange={(e) => onRoleChange(member, e.target.value)}
                className="text-xs border border-line rounded px-2 py-1 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="MEMBER">Member</option>
              </select>
              <button
                onClick={() => onRemove(member)}
                className="p-1.5 rounded text-ink-subtle hover:bg-danger-tint hover:text-danger transition-colors"
                title="Remove from organization"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
