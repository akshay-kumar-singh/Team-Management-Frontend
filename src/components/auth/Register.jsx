import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { Zap } from "lucide-react";
import toast from "react-hot-toast";

export const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: "",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.name,
        formData.organizationName,
      );

      toast.success("Registration successful!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      toast.error(error.message || "Registration failed");
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
            Create your account and workspace
          </p>

          <form onSubmit={handleSubmit} className="space-y-1">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter your name"
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter your email"
              required
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter your password"
              required
            />
            <Input
              label="Organization Name"
              type="text"
              value={formData.organizationName}
              onChange={(e) =>
                setFormData({ ...formData, organizationName: e.target.value })
              }
              placeholder="Your workspace name"
              required
            />
            <Button type="submit" disabled={loading} className="w-full !mt-4">
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink-subtle">
          Already have an account?{" "}
          <Link to="/login" className="text-brand font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
