import { useState, useEffect } from "react";
import { Plus, Trash2, SlidersHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import api from "../../services/api";

const TYPES = ["text", "number", "date", "select", "checkbox"];

/** Manage a project's custom field definitions (Phase 10). */
export const CustomFieldsModal = ({ isOpen, onClose, project, onSaved }) => {
  const [fields, setFields] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("text");
  const [options, setOptions] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setFields((project?.customFields || []).map((f) => ({ ...f })));
  }, [isOpen, project]);

  const addField = () => {
    if (!name.trim()) return;
    setFields((prev) => [
      ...prev,
      {
        id: "",
        name: name.trim(),
        type,
        options: type === "select" ? options.split(",").map((o) => o.trim()).filter(Boolean) : [],
      },
    ]);
    setName("");
    setType("text");
    setOptions("");
  };

  const removeField = (idx) => setFields((prev) => prev.filter((_, i) => i !== idx));

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/api/projects/${project._id}/custom-fields`, {
        customFields: fields.map(({ name: n, type: t, options: o, id }) => ({
          id,
          name: n,
          type: t,
          options: o,
        })),
      });
      onSaved?.(data);
      toast.success("Custom fields saved");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Custom fields" size="xl">
      <p className="text-sm text-ink-subtle mb-4 flex items-center gap-1.5">
        <SlidersHorizontal size={14} className="text-brand" /> Fields you add here appear on every issue in this project.
      </p>

      <div className="space-y-2 mb-5">
        {fields.length === 0 && <p className="text-xs text-ink-subtle italic">No custom fields yet.</p>}
        {fields.map((f, idx) => (
          <div key={idx} className="flex items-center gap-2 border border-line rounded px-3 py-2">
            <span className="text-sm text-ink flex-1">
              {f.name} <span className="text-ink-subtle">· {f.type}</span>
              {f.type === "select" && f.options?.length > 0 && (
                <span className="text-ink-subtle"> ({f.options.join(", ")})</span>
              )}
            </span>
            <button onClick={() => removeField(idx)} className="p-1 rounded text-ink-subtle hover:text-danger" title="Remove">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-line pt-4">
        <p className="text-xs font-semibold text-ink-subtle mb-2">Add a field</p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Field name"
            className="text-sm border border-line rounded px-2 py-1.5 bg-white flex-1 min-w-[140px]"
          />
          <select value={type} onChange={(e) => setType(e.target.value)} className="text-sm border border-line rounded px-2 py-1.5 bg-white">
            {TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
          {type === "select" && (
            <input
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              placeholder="comma,separated,options"
              className="text-sm border border-line rounded px-2 py-1.5 bg-white flex-1 min-w-[140px]"
            />
          )}
          <Button variant="secondary" onClick={addField}>
            <Plus size={15} className="mr-1" /> Add
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-line">
        <button onClick={onClose} className="text-sm text-ink-subtle px-3 py-2">Cancel</button>
        <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save fields"}</Button>
      </div>
    </Modal>
  );
};
