import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { Zap } from "lucide-react";
import toast from "react-hot-toast";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
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
            Log in to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-1">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <Button type="submit" disabled={loading} className="w-full !mt-4">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink-subtle">
          Don't have an account?{" "}
          <Link to="/register" className="text-brand font-medium hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};
