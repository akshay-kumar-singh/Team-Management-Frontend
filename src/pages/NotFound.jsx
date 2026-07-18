import { Link } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Home, SearchX } from "lucide-react";

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas p-4">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-brand-tint rounded-lg flex items-center justify-center">
            <SearchX size={32} className="text-brand" />
          </div>
        </div>
        <h1 className="text-6xl font-black mb-3 text-ink tracking-tight">404</h1>
        <h2 className="text-xl font-semibold mb-2 text-ink">Page not found</h2>
        <p className="text-ink-subtle mb-8 max-w-sm mx-auto text-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard">
          <Button className="gap-2">
            <Home size={16} />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
