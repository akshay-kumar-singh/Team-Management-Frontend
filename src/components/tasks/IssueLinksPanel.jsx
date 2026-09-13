import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Link2, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { TypeIcon } from "../common/TaskIcons";

// UI option → API {type, direction}. Bucket = key in the grouped response.
const LINK_OPTIONS = [
  { label: "blocks", type: "blocks", direction: "outward", bucket: "blocks" },
  { label: "is blocked by", type: "blocks", direction: "inward", bucket: "blockedBy" },
  { label: "duplicates", type: "duplicates", direction: "outward", bucket: "duplicates" },
  { label: "is duplicated by", type: "duplicates", direction: "inward", bucket: "duplicatedBy" },
  { label: "relates to", type: "relates", direction: "outward", bucket: "relates" },
];

const BUCKET_LABELS = {
  blocks: "blocks",
  blockedBy: "is blocked by",
  duplicates: "duplicates",
  duplicatedBy: "is duplicated by",
  relates: "relates to",
};

export const IssueLinksPanel = ({ taskId }) => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState({});
  const [adding, setAdding] = useState(false);
  const [optionIdx, setOptionIdx] = useState(0);
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchLinks = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/tasks/${taskId}/links`);
      setGroups(data);
    } catch {
      /* silent */
    }
  }, [taskId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const submit = async (e) => {
    e.preventDefault();
    if (!key.trim()) return;
    const opt = LINK_OPTIONS[optionIdx];
    setBusy(true);
    try {
      const { data } = await api.post(`/api/tasks/${taskId}/links`, {
        toKey: key.trim().toUpperCase(),
        type: opt.type,
        direction: opt.direction,
      });
      setGroups(data);
      setKey("");
      setAdding(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not add link");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (linkId) => {
    try {
      const { data } = await api.delete(`/api/tasks/${taskId}/links/${linkId}`);
      setGroups(data);
    } catch {
      toast.error("Could not remove link");
    }
  };

  const orderedBuckets = ["blocks", "blockedBy", "duplicates", "duplicatedBy", "relates"];
  const hasAny = orderedBuckets.some((b) => (groups[b] || []).length > 0);

  return (
    <div className="bg-white rounded-lg border border-line p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Link2 size={15} className="text-ink-subtle" /> Linked issues
        </h3>
        <button
          onClick={() => setAdding((a) => !a)}
          className="flex items-center gap-1 text-xs text-brand font-medium hover:underline"
        >
          <Plus size={13} /> Add link
        </button>
      </div>

      {adding && (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2 mb-3 bg-canvas border border-line rounded p-2">
          <select
            value={optionIdx}
            onChange={(e) => setOptionIdx(Number(e.target.value))}
            className="text-xs border border-line rounded px-2 py-1.5 bg-white"
          >
            {LINK_OPTIONS.map((o, i) => (
              <option key={o.label} value={i}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Issue key (e.g. WR-12)"
            className="text-xs border border-line rounded px-2 py-1.5 bg-white flex-1 min-w-[120px]"
          />
          <button
            type="submit"
            disabled={busy || !key.trim()}
            className="text-xs bg-brand text-white px-3 py-1.5 rounded font-medium disabled:opacity-60"
          >
            Link
          </button>
        </form>
      )}

      {!hasAny ? (
        <p className="text-xs text-ink-subtle italic">No linked issues.</p>
      ) : (
        <div className="space-y-3">
          {orderedBuckets
            .filter((b) => (groups[b] || []).length > 0)
            .map((b) => (
              <div key={b}>
                <p className="text-[11px] font-bold text-ink-subtle uppercase tracking-wide mb-1">
                  {BUCKET_LABELS[b]}
                </p>
                <div className="space-y-1">
                  {groups[b].map((item) => (
                    <div
                      key={item.linkId}
                      className="group flex items-center gap-2 px-2 py-1.5 rounded hover:bg-canvas"
                    >
                      <TypeIcon type={item.task.type} />
                      <button
                        onClick={() => item.task.key && navigate(`/browse/${item.task.key}`)}
                        className="flex items-center gap-2 flex-1 min-w-0 text-left"
                      >
                        <span className="text-[11px] font-medium text-ink-subtle flex-shrink-0">
                          {item.task.key}
                        </span>
                        <span className="text-sm text-ink truncate">{item.task.title}</span>
                      </button>
                      <button
                        onClick={() => remove(item.linkId)}
                        className="p-1 rounded text-ink-subtle hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove link"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
