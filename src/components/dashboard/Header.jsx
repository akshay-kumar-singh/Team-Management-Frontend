import { LogOut, Bell } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getInitials } from "../../utils/helpers";
import { Button } from "../common/Button";

export const Header = () => {
  const { userData, logout } = useAuth();

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="ml-12 lg:ml-0">
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Welcome back, {userData?.name}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {userData?.role}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-semibold text-base sm:text-lg shadow-lg">
          {getInitials(userData?.name)}
        </div>
        <Button
          variant="ghost"
          onClick={logout}
          className="hidden sm:flex hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={20} />
        </Button>
      </div>
    </div>
  );
};
