import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Folder,
  CheckSquare,
  MessageSquare,
  Users,
  Zap,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/projects", icon: Folder, label: "Projects" },
    { path: "/tasks", icon: CheckSquare, label: "Board" },
    { path: "/chat", icon: MessageSquare, label: "Chat" },
    { path: "/team", icon: Users, label: "Team" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="w-64 bg-white text-ink h-screen border-r border-line flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand rounded flex items-center justify-center">
            <Zap size={18} className="text-white" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-base font-bold text-ink leading-tight">Workzen</h1>
            <p className="text-[10px] text-ink-subtle leading-tight">
              Software project
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] text-ink-subtle uppercase tracking-widest font-semibold mb-2 px-3 mt-1">
          Planning
        </p>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded transition-colors duration-150 text-sm ${
                isActive
                  ? "bg-brand-tint text-brand font-medium border-l-2 border-brand"
                  : "text-ink-subtle hover:bg-gray-100 hover:text-ink border-l-2 border-transparent"
              }`
            }
          >
            <link.icon size={16} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout at bottom */}
      <div className="p-3 border-t border-line">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded text-sm text-ink-subtle hover:bg-danger-tint hover:text-danger transition-colors duration-150"
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
};
