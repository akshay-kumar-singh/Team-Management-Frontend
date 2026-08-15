import { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";

/**
 * Confirm sprint completion and choose where incomplete issues roll over.
 */
export const CompleteSprintModal = ({
  isOpen,
  onClose,
  sprint,
  futureSprints = [],
  totalCount,
  doneCount,
  onComplete,
}) => {
  const [target, setTarget] = useState(""); // "" = backlog
  const [submitting, setSubmitting] = useState(false);
  const incomplete = totalCount - doneCount;

  useEffect(() => {
    if (isOpen) setTarget("");
  }, [isOpen]);

  const submit = async () => {
    setSubmitting(true);
    try {
      await onComplete(sprint._id, { moveToSprintId: target || undefined });
      onClose();
    } catch {
      /* hook toasts the error */
    } finally {
      setSubmitting(false);
    }
  };

  if (!sprint) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Complete ${sprint.name}`}>
      <div className="space-y-4">
        <div className="bg-canvas border border-line rounded p-3 text-sm">
          <p className="text-ink">
            <strong>{doneCount}</strong> of <strong>{totalCount}</strong> issues completed.
          </p>
          {incomplete > 0 && (
            <p className="text-ink-subtle mt-1">
              {incomplete} unfinished {incomplete === 1 ? "issue" : "issues"} will move to:
            </p>
          )}
        </div>

        {incomplete > 0 && (
          <div>
            <label className="block text-xs font-semibold text-ink-subtle mb-1.5">Move to</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-line rounded text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            >
              <option value="">Backlog</option>
              {futureSprints.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Completing..." : "Complete sprint"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
