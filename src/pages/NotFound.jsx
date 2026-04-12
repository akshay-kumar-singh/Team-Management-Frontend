import { Link } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Home, AlertTriangle } from "lucide-react";

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
      <div className="absolute inset-0 bg-black opacity-20" />
      <div className="relative text-center text-white">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
            <AlertTriangle size={40} className="text-white" />
          </div>
        </div>
        <h1 className="text-8xl font-black mb-4 tracking-tight">404</h1>
        <h2 className="text-2xl font-bold mb-3">Page Not Found</h2>
        <p className="text-white/70 mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/dashboard">
          <Button className="gap-2">
            <Home size={18} />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
