import { Modal } from "../common/Modal";

const TONE = { ink: "text-ink", success: "text-success", warn: "text-warn", brand: "text-brand" };

const Stat = ({ label, value, tone = "ink" }) => (
  <div className="bg-canvas border border-line rounded p-3 text-center">
    <div className={`text-2xl font-bold ${TONE[tone]}`}>{value}</div>
    <div className="text-[11px] text-ink-subtle uppercase tracking-wide mt-0.5">{label}</div>
  </div>
);

const KeyList = ({ label, keys }) =>
  keys?.length ? (
    <div>
      <h4 className="text-xs font-bold text-ink-subtle uppercase tracking-wide mb-1.5">
        {label} ({keys.length})
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {keys.map((k) => (
          <span key={k} className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-ink-subtle">
            {k}
          </span>
        ))}
      </div>
    </div>
  ) : null;

/** Read-only end-of-sprint report from the frozen `sprint.report` snapshot. */
export const SprintReportModal = ({ isOpen, onClose, sprint }) => {
  const r = sprint?.report;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${sprint?.name || "Sprint"} — report`} size="2xl">
      {!r ? (
        <p className="text-sm text-ink-subtle">No report is available for this sprint.</p>
      ) : (
        <div className="space-y-5">
          {sprint.goal && (
            <p className="text-sm text-ink-subtle">
              <span className="font-semibold text-ink">Goal:</span> {sprint.goal}
            </p>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-column rounded-full overflow-hidden">
              <div className="h-full bg-success rounded-full" style={{ width: `${r.completionRate}%` }} />
            </div>
            <span className="text-sm font-bold text-success">{r.completionRate}% complete</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Committed" value={r.committed.count} />
            <Stat label="Completed" value={r.completed.count} tone="success" />
            <Stat label="Not done" value={r.notCompleted.count} tone="warn" />
            <Stat label="Added mid-sprint" value={r.added.count} tone="brand" />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div>
              <div className="font-semibold text-ink">{r.committed.points}</div>
              <div className="text-[11px] text-ink-subtle">Committed pts</div>
            </div>
            <div>
              <div className="font-semibold text-success">{r.completed.points}</div>
              <div className="text-[11px] text-ink-subtle">Completed pts</div>
            </div>
            <div>
              <div className="font-semibold text-warn">{r.notCompleted.points}</div>
              <div className="text-[11px] text-ink-subtle">Remaining pts</div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-line">
            <KeyList label="Completed" keys={r.completed.keys} />
            <KeyList label="Not completed (rolled over)" keys={r.notCompleted.keys} />
            <KeyList label="Added during sprint (scope change)" keys={r.added.keys} />
            <KeyList label="Removed during sprint" keys={r.removed.keys} />
          </div>
        </div>
      )}
    </Modal>
  );
};
