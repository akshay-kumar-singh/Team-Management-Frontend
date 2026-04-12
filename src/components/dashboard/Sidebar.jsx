import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Folder,
  CheckSquare,
  MessageSquare,
  Users,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/projects", icon: Folder, label: "Projects" },
    { path: "/tasks", icon: CheckSquare, label: "Tasks" },
    { path: "/chat", icon: MessageSquare, label: "Chat" },
    { path: "/team", icon: Users, label: "Team" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white h-screen shadow-2xl border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Workzen
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Team Hub</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-3 px-3">
          Navigation
        </p>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                isActive
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`
            }
          >
            <link.icon size={18} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout at bottom */}
      <div className="p-4 border-t border-gray-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-red-500/20 transition-all duration-200 text-sm font-medium group"
        >
          <LogOut size={18} className="group-hover:text-red-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
