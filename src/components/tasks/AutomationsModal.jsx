import { useState, useEffect, useCallback } from "react";
import { Zap, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import api from "../../services/api";
import { columnsOf } from "../../utils/constants";

const ACTIONS = [
  { value: "notify_reporter", label: "Notify the reporter" },
  { value: "notify_assignee", label: "Notify the assignee" },
  { value: "assign", label: "Assign to…" },
  { value: "add_label", label: "Add label…" },
];

/**
 * Manage a project's automation rules: "when an issue enters <column>, do X".
 */
export const AutomationsModal = ({ isOpen, onClose, project }) => {
  const columns = columnsOf(project);
  const [rules, setRules] = useState([]);
  const [members, setMembers] = useState([]);
  const [toStatus, setToStatus] = useState(columns[columns.length - 1]?.id || "");
  const [action, setAction] = useState("notify_reporter");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!project?._id) return;
    const [r, m] = await Promise.all([
      api.get(`/api/projects/${project._id}/automations`),
      api.get("/api/users/team"),
    ]);
    setRules(r.data);
    setMembers(m.data);
  }, [project?._id]);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  const columnName = (id) => columns.find((c) => c.id === id)?.name || id;
  const actionLabel = (rule) => {
    if (rule.action === "assign")
      return `Assign to ${members.find((m) => m._id === rule.value)?.name || "a member"}`;
    if (rule.action === "add_label") return `Add label "${rule.value}"`;
    return ACTIONS.find((a) => a.value === rule.action)?.label || rule.action;
  };

  const add = async () => {
    if ((action === "assign" || action === "add_label") && !value) {
      toast.error(action === "assign" ? "Pick a member" : "Enter a label");
      return;
    }
    setBusy(true);
    try {
      await api.post(`/api/projects/${project._id}/automations`, { toStatus, action, value });
      setValue("");
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not add rule");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (rule) => {
    await api.patch(`/api/projects/${project._id}/automations/${rule._id}`, { enabled: !rule.enabled });
    setRules((prev) => prev.map((r) => (r._id === rule._id ? { ...r, enabled: !r.enabled } : r)));
  };

  const remove = async (rule) => {
    await api.delete(`/api/projects/${project._id}/automations/${rule._id}`);
    setRules((prev) => prev.filter((r) => r._id !== rule._id));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Automations" size="xl">
      <p className="text-sm text-ink-subtle mb-4 flex items-center gap-1.5">
        <Zap size={14} className="text-brand" /> Run an action automatically when an issue moves to a column.
      </p>

      {/* Existing rules */}
      <div className="space-y-2 mb-5">
        {rules.length === 0 && (
          <p className="text-xs text-ink-subtle italic">No automations yet.</p>
        )}
        {rules.map((rule) => (
          <div key={rule._id} className="flex items-center gap-2 border border-line rounded px-3 py-2">
            <span className="text-sm text-ink flex-1">
              When an issue enters <b>{columnName(rule.toStatus)}</b> → {actionLabel(rule)}
            </span>
            <button
              onClick={() => toggle(rule)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                rule.enabled ? "bg-success-tint text-success" : "bg-gray-100 text-ink-subtle"
              }`}
            >
              {rule.enabled ? "ON" : "OFF"}
            </button>
            <button
              onClick={() => remove(rule)}
              className="p-1 rounded text-ink-subtle hover:text-danger"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add a rule */}
      <div className="border-t border-line pt-4">
        <p className="text-xs font-semibold text-ink-subtle mb-2">Add a rule</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-subtle">When entering</span>
          <select
            value={toStatus}
            onChange={(e) => setToStatus(e.target.value)}
            className="text-sm border border-line rounded px-2 py-1.5 bg-white"
          >
            {columns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <span className="text-sm text-ink-subtle">→</span>
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setValue("");
            }}
            className="text-sm border border-line rounded px-2 py-1.5 bg-white"
          >
            {ACTIONS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
          {action === "assign" && (
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="text-sm border border-line rounded px-2 py-1.5 bg-white"
            >
              <option value="">Pick member…</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          )}
          {action === "add_label" && (
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="label"
              className="text-sm border border-line rounded px-2 py-1.5 bg-white w-32"
            />
          )}
          <Button onClick={add} disabled={busy}>
            <Plus size={15} className="mr-1" /> Add
          </Button>
        </div>
      </div>
    </Modal>
  );
};
