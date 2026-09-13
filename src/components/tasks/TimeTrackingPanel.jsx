import { useState } from "react";
import { Clock, Plus } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

const fieldClass =
  "w-full text-sm border border-line rounded px-2.5 py-1.5 text-ink focus:outline-none focus:ring-2 focus:ring-brand/30";

const fmt = (h) => (h == null ? "—" : `${Number.isInteger(h) ? h : h.toFixed(1)}h`);

/**
 * Time tracking for a task: original estimate, logged time, and remaining, with
 * a spent-vs-remaining bar and a "Log work" form. Estimates save on blur; work
 * is logged through POST /api/tasks/:id/worklog.
 */
export const TimeTrackingPanel = ({ task, onChanged }) => {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState("");
  const [remaining, setRemaining] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const spent = task.timeSpent || 0;
  const remain = task.remainingEstimate;
  const denom = spent + (remain || 0);
  const pct = denom > 0 ? Math.round((spent / denom) * 100) : 0;

  const saveEstimate = async (field, value) => {
    const current = task[field] ?? "";
    if (String(value) === String(current)) return;
    try {
      await api.put(`/api/tasks/${task._id}`, { [field]: value });
      onChanged();
    } catch {
      toast.error("Could not save estimate");
    }
  };

  const logWork = async () => {
    const h = Number(hours);
    if (!Number.isFinite(h) || h <= 0) {
      toast.error("Enter a positive number of hours");
      return;
    }
    setBusy(true);
    try {
      await api.post(`/api/tasks/${task._id}/worklog`, {
        hours: h,
        remaining: remaining === "" ? undefined : Number(remaining),
        note: note.trim(),
      });
      toast.success(`Logged ${h}h`);
      setHours("");
      setRemaining("");
      setNote("");
      setOpen(false);
      onChanged();
    } catch {
      toast.error("Could not log work");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pt-3 border-t border-line">
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-subtle">
          <Clock size={13} /> Time tracking
        </label>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-xs text-brand font-medium hover:underline flex items-center gap-0.5"
        >
          <Plus size={12} /> Log work
        </button>
      </div>

      {/* Spent vs remaining bar */}
      {denom > 0 ? (
        <>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
            <div className="h-1.5 rounded-full bg-brand" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-ink-subtle mb-3">
            <span>{fmt(spent)} logged</span>
            <span>{fmt(remain)} remaining</span>
          </div>
        </>
      ) : (
        <p className="text-[11px] text-ink-subtle mb-3">No time logged yet.</p>
      )}

      {/* Log work form */}
      {open && (
        <div className="bg-canvas border border-line rounded p-2.5 mb-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-ink-subtle mb-1">Hours spent</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g. 2"
                className={fieldClass}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[11px] text-ink-subtle mb-1">Remaining (opt.)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={remaining}
                onChange={(e) => setRemaining(e.target.value)}
                placeholder="auto"
                className={fieldClass}
              />
            </div>
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What did you work on? (optional)"
            className={fieldClass}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="text-xs text-ink-subtle px-2 py-1">
              Cancel
            </button>
            <button
              onClick={logWork}
              disabled={busy}
              className="text-xs bg-brand text-white px-3 py-1.5 rounded font-medium disabled:opacity-60"
            >
              {busy ? "Saving…" : "Log"}
            </button>
          </div>
        </div>
      )}

      {/* Estimates */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] text-ink-subtle mb-1">Original est. (h)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            defaultValue={task.originalEstimate ?? ""}
            key={`oe-${task.originalEstimate}`}
            onBlur={(e) => saveEstimate("originalEstimate", e.target.value)}
            placeholder="—"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-[11px] text-ink-subtle mb-1">Remaining (h)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            defaultValue={task.remainingEstimate ?? ""}
            key={`re-${task.remainingEstimate}`}
            onBlur={(e) => saveEstimate("remainingEstimate", e.target.value)}
            placeholder="—"
            className={fieldClass}
          />
        </div>
      </div>
    </div>
  );
};
