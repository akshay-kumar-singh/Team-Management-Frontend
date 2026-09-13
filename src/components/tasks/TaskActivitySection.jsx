import { useState, useEffect, useCallback, useRef } from "react";
import { Send, Trash2, Bot, Paperclip } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { Avatar } from "../common/TaskIcons";
import { MarkdownContent } from "../common/MarkdownContent";
import { MarkdownToolbar } from "../common/MarkdownToolbar";

// Comments render as markdown; @mentions still notify but appear inline as text
const CommentContent = ({ content }) => <MarkdownContent content={content} />;

// Human sentence for a changelog entry
const activitySentence = (a) => {
  switch (a.field) {
    case "created":
      return "created this task";
    case "comment":
      return "added a comment";
    case "description":
      return "updated the description";
    default:
      return a.from || a.to
        ? `changed ${a.field} from "${a.from ?? "—"}" to "${a.to ?? "—"}"`
        : `changed ${a.field}`;
  }
};

export const TaskActivitySection = ({ taskId, teamMembers = [], refreshToken }) => {
  const { userData } = useAuth();
  const [tab, setTab] = useState("comments");
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // Mention picker state
  const [mentionQuery, setMentionQuery] = useState(null); // null = closed
  const [pickedMentions, setPickedMentions] = useState([]); // [{_id, name}]
  const textareaRef = useRef(null);
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // Attach a file to the issue and drop a markdown reference into the comment —
  // images embed inline, other files render as a download link.
  const attachToComment = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
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
      const md = data.resourceType === "image" ? `\n![${data.filename}](${data.url})\n` : `\n[${data.filename}](${data.url})\n`;
      setInput((prev) => prev + md);
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

  const fetchComments = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/tasks/${taskId}/comments`);
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [taskId]);

  const fetchActivity = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/tasks/${taskId}/activity`);
      setActivity(data);
    } catch (error) {
      console.error("Error fetching activity:", error);
    }
  }, [taskId]);

  useEffect(() => {
    fetchComments();
    fetchActivity();
  }, [fetchComments, fetchActivity, refreshToken]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    // Open the mention picker when the caret follows "@query"
    const caret = e.target.selectionStart;
    const before = value.slice(0, caret);
    const match = before.match(/@([\w ]{0,20})$/);
    setMentionQuery(match ? match[1].trimStart() : null);
  };

  const pickMention = (member) => {
    const el = textareaRef.current;
    const caret = el ? el.selectionStart : input.length;
    const before = input.slice(0, caret).replace(/@([\w ]{0,20})$/, `@${member.name} `);
    const after = input.slice(caret);
    setInput(before + after);
    setMentionQuery(null);
    setPickedMentions((prev) =>
      prev.some((m) => m._id === member._id) ? prev : [...prev, member]
    );
    el?.focus();
  };

  const mentionCandidates =
    mentionQuery !== null
      ? teamMembers.filter(
          (m) =>
            m._id !== userData?._id &&
            m.name.toLowerCase().includes(mentionQuery.toLowerCase())
        )
      : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    // Only count mentions whose @Name text is still present
    const mentions = pickedMentions
      .filter((m) => input.includes(`@${m.name}`))
      .map((m) => m._id);

    try {
      setSending(true);
      const { data } = await api.post(`/api/tasks/${taskId}/comments`, {
        content: input.trim(),
        mentions,
      });
      setComments((prev) => [data, ...prev]);
      setInput("");
      setPickedMentions([]);
      setMentionQuery(null);
      fetchActivity();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await api.delete(`/api/tasks/${taskId}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-line p-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-line -mx-6 px-6">
        {[
          { id: "comments", label: `Comments (${comments.length})` },
          { id: "history", label: "History" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? "border-brand text-brand"
                : "border-transparent text-ink-subtle hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "comments" ? (
        <div>
          {/* Composer with mention picker (top, newest comments follow below) */}
          <form onSubmit={handleSubmit} className="relative mb-5">
            {mentionQuery !== null && mentionCandidates.length > 0 && (
              <div className="absolute top-full mt-1 left-0 w-64 bg-white border border-line rounded-lg shadow-xl z-10 overflow-hidden">
                {mentionCandidates.slice(0, 5).map((m) => (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => pickMention(m)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-brand-tint transition-colors"
                  >
                    <Avatar name={m.name} size="sm" />
                    <span className="text-sm text-ink">{m.name}</span>
                  </button>
                ))}
              </div>
            )}

            <MarkdownToolbar textareaRef={textareaRef} value={input} onChange={setInput} />
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Add a comment... (markdown & @mention supported)"
                rows={2}
                className="flex-1 px-3 py-2 bg-white border border-line rounded-b rounded-tr text-sm text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="p-2.5 rounded border border-line text-ink-subtle hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Attach a file or image"
              >
                <Paperclip size={15} />
              </button>
              <input ref={fileRef} type="file" className="hidden" onChange={attachToComment} />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="bg-brand text-white p-2.5 rounded hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send"
              >
                <Send size={15} />
              </button>
            </div>
          </form>

          {/* Comment list — newest first */}
          <div className="space-y-4">
            {comments.length === 0 && (
              <p className="text-sm text-ink-subtle italic">
                No comments yet. Start the conversation — type @ to mention a teammate.
              </p>
            )}
            {comments.map((c) => {
              const canDelete =
                c.authorId?._id === userData?._id || userData?.role === "ADMIN";
              return (
                <div key={c._id} className="group flex gap-3">
                  <Avatar name={c.authorId?.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink">
                        {c.authorId?.name || "Unknown"}
                      </span>
                      <span className="text-[11px] text-ink-subtle">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </span>
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-danger-tint rounded text-ink-subtle hover:text-danger transition-all"
                          title="Delete comment"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <div className="mt-1">
                      <CommentContent content={c.content} mentions={c.mentions} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* History tab */
        <div className="space-y-3">
          {activity.length === 0 && (
            <p className="text-sm text-ink-subtle italic">No history yet.</p>
          )}
          {activity.map((a) => (
            <div key={a._id} className="flex gap-3 items-start">
              {a.actorId ? (
                <Avatar name={a.actorId.name} size="sm" />
              ) : (
                <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full inline-flex items-center justify-center flex-shrink-0">
                  <Bot size={13} />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-sm text-ink leading-snug">
                  <span className="font-semibold">
                    {a.actorId?.name || "AI Agent"}
                  </span>{" "}
                  <span className="text-ink-subtle">{activitySentence(a)}</span>
                </p>
                <p className="text-[11px] text-ink-subtle mt-0.5">
                  {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
