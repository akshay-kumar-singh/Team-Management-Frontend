const fieldClass =
  "w-full px-2.5 py-1.5 bg-white border border-line rounded text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30";

/**
 * Renders a project's custom fields as editable inputs on the task detail,
 * bound to the task's stored `customValues`. Saves the full map on change/blur.
 */
export const CustomFieldValues = ({ fields = [], values = {}, onSave }) => {
  if (!fields.length) return null;

  const set = (id, value) => onSave({ ...values, [id]: value });

  return (
    <div className="pt-3 border-t border-line space-y-3">
      <p className="text-xs font-bold text-ink-subtle uppercase tracking-wide">More fields</p>
      {fields.map((f) => {
        const v = values[f.id] ?? "";
        return (
          <div key={f.id}>
            <label className="block text-xs font-semibold text-ink-subtle mb-1.5">{f.name}</label>
            {f.type === "text" && (
              <input
                defaultValue={v}
                key={`${f.id}-${v}`}
                onBlur={(e) => e.target.value !== String(v) && set(f.id, e.target.value)}
                className={fieldClass}
                placeholder="—"
              />
            )}
            {f.type === "number" && (
              <input
                type="number"
                defaultValue={v}
                key={`${f.id}-${v}`}
                onBlur={(e) => e.target.value !== String(v) && set(f.id, e.target.value === "" ? "" : Number(e.target.value))}
                className={fieldClass}
                placeholder="—"
              />
            )}
            {f.type === "date" && (
              <input
                type="date"
                value={v ? String(v).slice(0, 10) : ""}
                onChange={(e) => set(f.id, e.target.value)}
                className={fieldClass}
              />
            )}
            {f.type === "select" && (
              <select value={v} onChange={(e) => set(f.id, e.target.value)} className={fieldClass}>
                <option value="">—</option>
                {(f.options || []).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            )}
            {f.type === "checkbox" && (
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={!!v} onChange={(e) => set(f.id, e.target.checked)} />
                {v ? "Yes" : "No"}
              </label>
            )}
          </div>
        );
      })}
    </div>
  );
};
