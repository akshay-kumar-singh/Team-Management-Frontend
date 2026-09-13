import { useState, useEffect, useRef } from "react";
import { Building2, Upload, ScrollText, Save } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { getInitials, formatRelativeTime } from "../utils/helpers";

const AUDIT_LABELS = {
  "org.updated": "updated org settings",
  "org.avatar_changed": "changed the org logo",
  "member.role_changed": "changed a member's role",
  "member.removed": "removed a member",
  "project.archived": "archived a project",
  "project.restored": "restored a project",
  "project.purged": "permanently deleted a project",
  "tasks.imported": "imported issues",
  "invite.resent": "resent an invitation",
  "invite.revoked": "revoked an invitation",
  "automation.created": "created an automation",
};

const auditSentence = (a) => {
  const base = AUDIT_LABELS[a.action] || a.action;
  const detail = a.targetLabel ? ` — ${a.targetLabel}` : "";
  const change =
    a.meta?.from && a.meta?.to ? ` (${a.meta.from} → ${a.meta.to})` : "";
  return `${base}${detail}${change}`;
};

export const OrgSettings = () => {
  const { userData } = useAuth();
  const [org, setOrg] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [audit, setAudit] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const isAdmin = userData?.role === "ADMIN";

  useEffect(() => {
    api.get("/api/org").then(({ data }) => {
      setOrg(data);
      setName(data.name || "");
      setDescription(data.description || "");
    });
    if (isAdmin) api.get("/api/org/audit").then(({ data }) => setAudit(data)).catch(() => {});
  }, [isAdmin]);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/api/org", { name, description });
      setOrg((o) => ({ ...o, ...data }));
      toast.success("Saved");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const onAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    try {
      const { data } = await api.post("/api/org/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setOrg((o) => ({ ...o, avatarUrl: data.avatarUrl }));
      toast.success("Logo updated");
    } catch (err) {
      toast.error(
        err?.response?.data?.code === "UPLOADS_DISABLED"
          ? "Image uploads aren't configured on this server"
          : "Upload failed"
      );
    }
  };

  if (!org) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-white border border-line rounded-lg p-12 text-center text-ink-subtle">
        <Building2 size={36} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium text-ink">Organization settings</p>
        <p className="text-sm mt-1">Only an admin can change organization settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-ink mb-0.5">Organization settings</h1>
        <p className="text-ink-subtle text-sm">Identity, logo, and the admin action log.</p>
      </div>

      {/* Identity */}
      <div className="bg-white rounded-lg border border-line p-5">
        <div className="flex items-center gap-4 mb-5">
          {org.avatarUrl ? (
            <img src={org.avatarUrl} alt="Org logo" className="w-16 h-16 rounded-lg object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-brand text-white flex items-center justify-center text-xl font-bold">
              {getInitials(org.name)}
            </div>
          )}
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-sm text-brand font-medium hover:underline"
            >
              <Upload size={14} /> Change logo
            </button>
            <p className="text-[11px] text-ink-subtle mt-1">PNG or JPG, up to 4 MB.</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatar} />
          </div>
          <span className="ml-auto flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-tint text-brand uppercase">
              {org.plan}
            </span>
            <span className="text-xs text-ink-subtle">
              {org.memberCount} members · {org.projectCount} projects
            </span>
          </span>
        </div>

        <label className="block text-xs font-semibold text-ink-subtle mb-1.5">Organization name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-line rounded text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 mb-4"
        />
        <label className="block text-xs font-semibold text-ink-subtle mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="What does your team do?"
          className="w-full px-3 py-2 border border-line rounded text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 resize-y mb-4"
        />
        <button
          onClick={save}
          disabled={saving || !name.trim()}
          className="flex items-center gap-1.5 bg-brand text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-60"
        >
          <Save size={15} /> {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {/* Audit log */}
      <div className="bg-white rounded-lg border border-line p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink mb-4">
          <ScrollText size={15} className="text-ink-subtle" /> Admin activity log
        </h2>
        {audit.length === 0 ? (
          <p className="text-xs text-ink-subtle italic">No admin actions recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {audit.map((a) => (
              <div key={a._id} className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-brand-tint text-brand flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  {getInitials(a.actorId?.name || "?")}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-ink leading-snug">
                    <span className="font-medium">{a.actorId?.name || "Someone"}</span>{" "}
                    <span className="text-ink-subtle">{auditSentence(a)}</span>
                  </p>
                  <p className="text-[11px] text-ink-subtle mt-0.5">{formatRelativeTime(a.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
