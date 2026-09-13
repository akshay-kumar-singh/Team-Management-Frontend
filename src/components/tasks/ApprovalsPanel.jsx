import { useState } from "react";
import { ShieldCheck, Check, X, Plus, Clock } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { Avatar } from "../common/TaskIcons";

const DECISION = {
  pending: { icon: Clock, cls: "text-warn", label: "Pending" },
  approved: { icon: Check, cls: "text-success", label: "Approved" },
  rejected: { icon: X, cls: "text-danger", label: "Rejected" },
};

/**
 * Request approvals from teammates and record your own decision. `approvals`
 * comes populated ({ userId: {name}, decision, note }) from the task detail.
 */
export const ApprovalsPanel = ({ taskId, approvals = [], teamMembers = [], onChanged }) => {
  const { userData } = useAuth();
  const [adding, setAdding] = useState(false);
  const [picked, setPicked] = useState("");

  const myPending = approvals.find(
    (a) => (a.userId?._id || a.userId) === userData?._id && a.decision === "pending"
  );

  const request = async () => {
    if (!picked) return;
    try {
      await api.post(`/api/tasks/${taskId}/approvals`, { approverIds: [picked] });
      setPicked("");
      setAdding(false);
      onChanged();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not request approval");
    }
  };

  const decide = async (decision) => {
    try {
      await api.post(`/api/tasks/${taskId}/approvals/decide`, { decision });
      toast.success(`You ${decision} this issue`);
      onChanged();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not submit decision");
    }
  };

  // Members not already asked
  const askedIds = new Set(approvals.map((a) => a.userId?._id || a.userId));
  const candidates = teamMembers.filter((m) => !askedIds.has(m._id) && m._id !== userData?._id);

  return (
    <div className="bg-white rounded-lg border border-line p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <ShieldCheck size={15} className="text-ink-subtle" /> Approvals
        </h3>
        {candidates.length > 0 && (
          <button
            onClick={() => setAdding((a) => !a)}
            className="flex items-center gap-1 text-xs text-brand font-medium hover:underline"
          >
            <Plus size={13} /> Request
          </button>
        )}
      </div>

      {adding && (
        <div className="flex items-center gap-2 mb-3 bg-canvas border border-line rounded p-2">
          <select
            value={picked}
            onChange={(e) => setPicked(e.target.value)}
            className="text-xs border border-line rounded px-2 py-1.5 bg-white flex-1"
          >
            <option value="">Choose approver…</option>
            {candidates.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
          <button
            onClick={request}
            disabled={!picked}
            className="text-xs bg-brand text-white px-3 py-1.5 rounded font-medium disabled:opacity-60"
          >
            Ask
          </button>
        </div>
      )}

      {approvals.length === 0 ? (
        <p className="text-xs text-ink-subtle italic">No approvals requested.</p>
      ) : (
        <div className="space-y-2">
          {approvals.map((a) => {
            const s = DECISION[a.decision] || DECISION.pending;
            const Icon = s.icon;
            return (
              <div key={a._id} className="flex items-center gap-2">
                <Avatar name={a.userId?.name} size="sm" />
                <span className="text-sm text-ink flex-1 truncate">{a.userId?.name || "Member"}</span>
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${s.cls}`}>
                  <Icon size={13} /> {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {myPending && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-line">
          <button
            onClick={() => decide("approved")}
            className="flex-1 flex items-center justify-center gap-1.5 bg-success-tint text-success rounded py-1.5 text-sm font-medium hover:opacity-90"
          >
            <Check size={15} /> Approve
          </button>
          <button
            onClick={() => decide("rejected")}
            className="flex-1 flex items-center justify-center gap-1.5 bg-danger-tint text-danger rounded py-1.5 text-sm font-medium hover:opacity-90"
          >
            <X size={15} /> Reject
          </button>
        </div>
      )}
    </div>
  );
};
