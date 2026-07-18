import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { Zap } from "lucide-react";
import toast from "react-hot-toast";

export const Join = () => {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const { registerFromInvite } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract token and email from URL parameters
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");
    const urlEmail = params.get("email");

    if (!urlToken || !urlEmail) {
      toast.error("Invalid invitation link. Please request a new one.");
      navigate("/login");
    } else {
      setToken(urlToken);
      setEmail(urlEmail);
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerFromInvite(email, formData.password, formData.name, token);

      toast.success("Welcome aboard!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      toast.error(
        error.message || "Failed to join workspace. Link may be expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-brand rounded flex items-center justify-center">
            <Zap size={22} className="text-white" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Workzen</h1>
        </div>

        <div className="bg-white rounded-lg border border-line shadow-sm p-8">
          <p className="text-sm font-semibold text-ink text-center mb-6">
            Join your workspace
          </p>

          <form onSubmit={handleSubmit} className="space-y-1">
            <Input label="Email" type="email" value={email} disabled />
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter your name"
              required
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Create a strong password"
              required
            />
            <Button type="submit" disabled={loading} className="w-full !mt-4">
              {loading ? "Joining..." : "Accept Invitation"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink-subtle">
          Wrong account?{" "}
          <Link to="/login" className="text-brand font-medium hover:underline">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
};
