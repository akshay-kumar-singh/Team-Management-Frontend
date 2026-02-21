import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Folder,
  CheckSquare,
  MessageSquare,
  Users,
  Sparkles,
} from "lucide-react";

export const Sidebar = () => {
  const links = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/projects", icon: Folder, label: "Projects" },
    { path: "/tasks", icon: CheckSquare, label: "Tasks" },
    { path: "/chat", icon: MessageSquare, label: "Chat" },
    { path: "/team", icon: Users, label: "Team" },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white h-screen shadow-2xl border-r border-gray-700 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Workzen
            </h1>
            <p className="text-xs text-gray-400">Team Hub</p>
          </div>
        </div>

        <nav className="space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50"
                    : "hover:bg-white/10 hover:translate-x-1"
                }`
              }
            >
              <link.icon size={20} />
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};
