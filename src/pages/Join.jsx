import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
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
      await registerFromInvite(
        email,
        formData.password,
        formData.name,
        token
      );

      toast.success("Welcome aboard!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      toast.error(error.message || "Failed to join workspace. Link may be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="absolute inset-0 backdrop-blur-3xl"></div>

      <div className="relative w-full max-w-md">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        
        <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Workzen
            </h1>
            <p className="text-white/80 text-sm">Join your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              disabled
              className="opacity-70 cursor-not-allowed"
            />
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
              label="Secure Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Create a strong password"
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Joining..." : "Accept Invitation"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/80">
            Wrong account?{" "}
            <Link
              to="/login"
              className="text-white font-semibold hover:underline"
            >
              Sign In Instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
