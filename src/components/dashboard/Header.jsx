import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Avatar } from "../common/TaskIcons";
import { NotificationBell } from "../notifications/NotificationBell";
import { GlobalSearch } from "./GlobalSearch";
import { ThemeToggle } from "../common/ThemeToggle";

export const Header = ({ onMenuClick, sidebarOpen }) => {
  const { userData, logout } = useAuth();

  return (
    <div className="bg-white border-b border-line px-4 sm:px-6 py-2.5 flex justify-between items-center sticky top-0 z-20">
      {/* Left: hamburger + greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 text-ink-subtle hover:bg-gray-100 rounded transition-colors"
          aria-label="Toggle sidebar"
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-semibold text-ink leading-tight">
            {userData?.name || "User"}
          </h2>
          {userData?.role && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide bg-gray-200 text-gray-700">
              {userData.role}
            </span>
          )}
        </div>
      </div>

      {/* Right: search + bell + avatar + logout */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <GlobalSearch />

        <ThemeToggle />

        <NotificationBell />

        <Avatar name={userData?.name} size="md" />

        <button
          onClick={logout}
          title="Sign out"
          className="p-2 hover:bg-danger-tint hover:text-danger text-ink-subtle rounded transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
};
