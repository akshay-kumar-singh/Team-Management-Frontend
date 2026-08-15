import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Flag } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { columnsOf } from "../../utils/constants";

const slugify = (name, taken) => {
  const base =
    (name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24) || "col";
  let candidate = base;
  let n = 1;
  while (taken.includes(candidate)) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
};

const fieldClass =
  "px-2.5 py-1.5 bg-white border border-line rounded text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand";

/**
 * Edit a project's board: columns (name / order / WIP limit) and workflow
 * transition rules. The last column always marks issues complete.
 */
export const BoardSettingsModal = ({ isOpen, onClose, project, onSave }) => {
  const [cols, setCols] = useState([]);
  const [transitions, setTransitions] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCols(columnsOf(project).map((c) => ({ ...c })));
    setTransitions({ ...(project?.transitions || {}) });
  }, [isOpen, project]);

  const updateCol = (i, patch) =>
    setCols((cs) => cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= cols.length) return;
    setCols((cs) => {
      const a = [...cs];
      [a[i], a[j]] = [a[j], a[i]];
      return a;
    });
  };

  const removeCol = (i) => {
    const removed = cols[i];
    setCols((cs) => cs.filter((_, idx) => idx !== i));
    // Drop any workflow rules that referenced the removed column
    setTransitions((t) => {
      const next = {};
      for (const [from, tos] of Object.entries(t)) {
        if (from === removed.id) continue;
        next[from] = tos.filter((x) => x !== removed.id);
      }
      return next;
    });
  };

  const addCol = () => {
    if (cols.length >= 8) return;
    setCols((cs) => [
      ...cs,
      { id: slugify("new column", cs.map((c) => c.id)), name: "New Column", wipLimit: null },
    ]);
  };

  const toggleRestrict = (fromId) =>
    setTransitions((t) => {
      const next = { ...t };
      if (next[fromId]) {
        delete next[fromId]; // remove rule → open (can move anywhere)
      } else {
        // Restrict; start with every other column allowed
        next[fromId] = cols.filter((c) => c.id !== fromId).map((c) => c.id);
      }
      return next;
    });

  const toggleTarget = (fromId, toId) =>
    setTransitions((t) => {
      const cur = t[fromId] || [];
      const next = cur.includes(toId) ? cur.filter((x) => x !== toId) : [...cur, toId];
      return { ...t, [fromId]: next };
    });

  const handleSave = async () => {
    if (cols.some((c) => !c.name.trim())) {
      toast.error("Every column needs a name");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        columns: cols.map((c) => ({
          id: c.id,
          name: c.name.trim(),
          wipLimit: c.wipLimit === "" || c.wipLimit == null ? null : Number(c.wipLimit),
        })),
        transitions,
      });
      onClose();
    } catch {
      /* onSave surfaces its own error toast */
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Board settings" size="2xl">
      {/* Columns */}
      <section className="mb-6">
        <h3 className="text-xs font-bold text-ink-subtle uppercase tracking-wide mb-1">Columns</h3>
        <p className="text-xs text-ink-subtle mb-3">
          Drag order with the arrows. The <strong>last column</strong> marks issues complete. Set a
          WIP limit to highlight an overloaded column.
        </p>

        <div className="space-y-2">
          {cols.map((col, i) => (
            <div key={col.id} className="flex items-center gap-2">
              <div className="flex flex-col">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="text-ink-subtle hover:text-brand disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === cols.length - 1}
                  className="text-ink-subtle hover:text-brand disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              <input
                value={col.name}
                onChange={(e) => updateCol(i, { name: e.target.value })}
                className={`${fieldClass} flex-1`}
                placeholder="Column name"
              />

              <input
                type="number"
                min="1"
                value={col.wipLimit ?? ""}
                onChange={(e) =>
                  updateCol(i, { wipLimit: e.target.value === "" ? null : e.target.value })
                }
                className={`${fieldClass} w-20`}
                placeholder="WIP"
                title="WIP limit (blank = none)"
              />

              {i === cols.length - 1 && (
                <span
                  title="Completion column"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-success"
                >
                  <Flag size={12} /> Done
                </span>
              )}

              <button
                onClick={() => removeCol(i)}
                disabled={cols.length <= 2}
                title={cols.length <= 2 ? "A board needs at least 2 columns" : "Remove column"}
                className="p-1.5 rounded text-ink-subtle hover:text-danger hover:bg-danger-tint disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {cols.length < 8 && (
          <button
            onClick={addCol}
            className="mt-3 inline-flex items-center gap-1 text-sm text-brand hover:underline font-medium"
          >
            <Plus size={14} /> Add column
          </button>
        )}
      </section>

      {/* Workflow rules */}
      <section className="mb-2">
        <h3 className="text-xs font-bold text-ink-subtle uppercase tracking-wide mb-1">
          Workflow rules
        </h3>
        <p className="text-xs text-ink-subtle mb-3">
          By default a card can move anywhere. Turn on a limit to control which columns cards in a
          given column may move to.
        </p>

        <div className="space-y-2">
          {cols.map((from) => {
            const restricted = Boolean(transitions[from.id]);
            return (
              <div key={from.id} className="border border-line rounded p-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={restricted}
                    onChange={() => toggleRestrict(from.id)}
                    className="accent-brand"
                  />
                  <span className="text-sm font-medium text-ink">
                    Limit moves from <span className="text-brand">{from.name}</span>
                  </span>
                </label>

                {restricted && (
                  <div className="flex flex-wrap gap-2 mt-2 pl-6">
                    {cols
                      .filter((to) => to.id !== from.id)
                      .map((to) => (
                        <label
                          key={to.id}
                          className="inline-flex items-center gap-1 text-xs text-ink-subtle cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={(transitions[from.id] || []).includes(to.id)}
                            onChange={() => toggleTarget(from.id, to.id)}
                            className="accent-brand"
                          />
                          {to.name}
                        </label>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-line">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save board"}
        </Button>
      </div>
    </Modal>
  );
};
