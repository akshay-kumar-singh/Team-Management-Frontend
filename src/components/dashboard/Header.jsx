import { LogOut, Bell, Menu, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getInitials } from "../../utils/helpers";
import { Button } from "../common/Button";

export const Header = ({ onMenuClick, sidebarOpen }) => {
  const { userData, logout } = useAuth();

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 z-20">
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div>
          <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Welcome back, {userData?.name || "User"}
          </h2>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-0.5">
            {userData?.role}
          </span>
        </div>
      </div>

      {/* Right: bell + avatar + logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <Bell size={18} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm sm:text-base shadow-lg">
          {getInitials(userData?.name)}
        </div>

        <button
          onClick={logout}
          title="Sign out"
          className="p-2 hover:bg-red-50 hover:text-red-600 text-gray-500 rounded-xl transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};
