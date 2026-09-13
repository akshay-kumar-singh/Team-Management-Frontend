import { useState, useEffect, useCallback } from "react";
import { Mail, RefreshCw, X, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { formatRelativeTime } from "../../utils/helpers";

const STATUS_STYLES = {
  pending: { icon: Clock, cls: "bg-warn-tint text-warn", label: "Waiting" },
  accepted: { icon: CheckCircle2, cls: "bg-success-tint text-success", label: "Accepted" },
  expired: { icon: AlertCircle, cls: "bg-gray-100 text-ink-subtle", label: "Expired" },
};

export const PendingInvites = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = useCallback(async () => {
    try {
      const { data } = await api.get("/api/org/invites");
      setInvites(data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const resend = async (id) => {
    try {
      await api.post(`/api/org/invites/${id}/resend`);
      toast.success("Invitation resent");
      fetchInvites();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not resend");
    }
  };

  const revoke = async (id) => {
    if (!window.confirm("Revoke this invitation?")) return;
    try {
      await api.delete(`/api/org/invites/${id}`);
      setInvites((prev) => prev.filter((i) => i._id !== id));
    } catch {
      toast.error("Could not revoke");
    }
  };

  if (loading || invites.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold text-ink mb-3">Invitations ({invites.length})</h2>
      <div className="bg-white border border-line rounded-lg divide-y divide-line">
        {invites.map((inv) => {
          const s = STATUS_STYLES[inv.status] || STATUS_STYLES.pending;
          const Icon = s.icon;
          const resolved = inv.status === "accepted";
          return (
            <div key={inv._id} className="flex items-center gap-3 px-4 py-3">
              <Mail size={15} className="text-ink-subtle flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink truncate">{inv.email}</p>
                <p className="text-[11px] text-ink-subtle">
                  {inv.role} · invited {formatRelativeTime(inv.createdAt)}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide flex items-center gap-1 ${s.cls}`}
              >
                <Icon size={11} />
                {s.label}
              </span>
              {!resolved && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => resend(inv._id)}
                    className="p-1.5 rounded text-ink-subtle hover:bg-brand-tint hover:text-brand transition-colors"
                    title="Resend"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button
                    onClick={() => revoke(inv._id)}
                    className="p-1.5 rounded text-ink-subtle hover:bg-danger-tint hover:text-danger transition-colors"
                    title="Revoke"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
