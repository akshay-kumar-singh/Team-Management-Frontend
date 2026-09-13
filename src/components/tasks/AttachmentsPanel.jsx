import { useState, useEffect, useRef, useCallback } from "react";
import { Paperclip, Upload, Trash2, FileText, Download } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const prettyBytes = (n) => {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

export const AttachmentsPanel = ({ taskId }) => {
  const { userData } = useAuth();
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const fetchItems = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/tasks/${taskId}/attachments`);
      setItems(data);
    } catch {
      /* silent */
    }
  }, [taskId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is larger than 10 MB");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    try {
      const { data } = await api.post(`/api/tasks/${taskId}/attachments`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setItems((prev) => [data, ...prev]);
      toast.success("Attached");
    } catch (err) {
      toast.error(
        err?.response?.data?.code === "UPLOADS_DISABLED"
          ? "File uploads aren't configured on this server"
          : "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  const remove = async (att) => {
    if (!window.confirm("Delete this attachment?")) return;
    try {
      await api.delete(`/api/tasks/${taskId}/attachments/${att._id}`);
      setItems((prev) => prev.filter((a) => a._id !== att._id));
    } catch {
      toast.error("Could not delete");
    }
  };

  const canRemove = (att) =>
    att.uploaderId?._id === userData?._id || userData?.role === "ADMIN";

  return (
    <div className="bg-white rounded-lg border border-line p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Paperclip size={15} className="text-ink-subtle" /> Attachments
          {items.length > 0 && <span className="text-ink-subtle font-normal">({items.length})</span>}
        </h3>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 text-xs text-brand font-medium hover:underline disabled:opacity-60"
        >
          <Upload size={13} /> {uploading ? "Uploading…" : "Add file"}
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={onPick} />
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-ink-subtle italic">No attachments yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((att) => (
            <div key={att._id} className="group relative border border-line rounded overflow-hidden">
              {att.resourceType === "image" ? (
                <a href={att.url} target="_blank" rel="noopener noreferrer">
                  <img src={att.url} alt={att.filename} className="w-full h-24 object-cover" />
                </a>
              ) : (
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center h-24 bg-canvas text-ink-subtle hover:text-brand"
                >
                  <FileText size={22} />
                  <Download size={12} className="mt-1" />
                </a>
              )}
              <div className="px-2 py-1.5 border-t border-line">
                <p className="text-[11px] text-ink truncate" title={att.filename}>
                  {att.filename}
                </p>
                <p className="text-[10px] text-ink-subtle">{prettyBytes(att.bytes)}</p>
              </div>
              {canRemove(att) && (
                <button
                  onClick={() => remove(att)}
                  className="absolute top-1 right-1 p-1 rounded bg-white/90 text-ink-subtle hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
