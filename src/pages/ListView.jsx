import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, X, ArrowUp, ArrowDown, Save, Star, Trash2, Download, Upload, Archive, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { ViewTabs } from "../components/common/ViewTabs";
import { TypeIcon, PriorityIcon, StatusLozenge, Avatar, StoryPoints } from "../components/common/TaskIcons";
import { columnsOf } from "../utils/constants";
import { formatDate } from "../utils/helpers";

const selectClass =
  "px-2.5 py-1.5 bg-white border border-line rounded text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand";
const EMPTY = { search: "", status: "", assignee: "", priority: "", type: "", label: "", sprint: "" };
const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export const ListView = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [savedFilters, setSavedFilters] = useState([]);
  const [filters, setFilters] = useState(EMPTY);
  const [sort, setSort] = useState({ field: "key", dir: "asc" });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(() => new Set());
  const [showArchived, setShowArchived] = useState(false);
  const [archived, setArchived] = useState([]);
  const importRef = useRef(null);
  const { userData } = useAuth();
  const canManage = userData?.role === "ADMIN" || userData?.role === "MANAGER";

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      const [projRes, taskRes, memRes, sprintRes, filterRes] = await Promise.all([
        api.get("/api/projects"),
        api.get(`/api/tasks?projectId=${projectId}&all=true`),
        api.get("/api/users/team"),
        api.get(`/api/sprints?projectId=${projectId}`),
        api.get("/api/filters"),
      ]);
      setProject(projRes.data.find((p) => p._id === projectId) || null);
      setTasks(taskRes.data);
      setMembers(memRes.data);
      setSprints(sprintRes.data);
      setSavedFilters(filterRes.data);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Multi-select + bulk edit ──
  const toggleSelect = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = (ids) =>
    setSelected((prev) => (ids.every((id) => prev.has(id)) ? new Set() : new Set(ids)));
  const clearSelection = () => setSelected(new Set());

  const applyBulk = async (updates) => {
    const ids = [...selected];
    if (ids.length === 0) return;
    try {
      const { data } = await api.patch("/api/tasks/bulk", { ids, updates });
      toast.success(`Updated ${data.modified} issue${data.modified === 1 ? "" : "s"}`);
      clearSelection();
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Bulk update failed");
    }
  };

  // ── CSV export / import ──
  const exportCsv = async () => {
    try {
      const res = await api.get(`/api/tasks/export?projectId=${projectId}`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project?.key || "issues"}-export.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    }
  };

  const importCsv = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const csv = await file.text();
    try {
      const { data } = await api.post(`/api/projects/${projectId}/import`, { csv });
      toast.success(
        `Imported ${data.created} issue${data.created === 1 ? "" : "s"}` +
          (data.errors?.length ? ` · ${data.errors.length} row(s) skipped` : "")
      );
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Import failed");
    }
  };

  // ── Archived issues bin ──
  const toggleArchived = async () => {
    const next = !showArchived;
    setShowArchived(next);
    if (next) {
      try {
        const { data } = await api.get(`/api/tasks?projectId=${projectId}&archived=true`);
        setArchived(data);
      } catch {
        toast.error("Could not load archived issues");
      }
    }
  };
  const restoreTask = async (t) => {
    try {
      await api.post(`/api/tasks/${t._id}/restore`);
      setArchived((prev) => prev.filter((x) => x._id !== t._id));
      load();
      toast.success("Issue restored");
    } catch {
      toast.error("Could not restore");
    }
  };
  const purgeTask = async (t) => {
    if (!window.confirm(`Permanently delete ${t.key}? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/tasks/${t._id}/purge`);
      setArchived((prev) => prev.filter((x) => x._id !== t._id));
      toast.success("Issue permanently deleted");
    } catch {
      toast.error("Could not delete");
    }
  };

  const columns = columnsOf(project);
  const statusName = (id) => columns.find((c) => c.id === id)?.name || id;
  const sprintName = (id) => sprints.find((s) => s._id === id)?.name || "—";
  const labelOptions = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => (t.labels || []).forEach((l) => set.add(l)));
    return [...set].sort();
  }, [tasks]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (q && !`${t.key} ${t.title}`.toLowerCase().includes(q)) return false;
      if (filters.status && t.status !== filters.status) return false;
      if (filters.assignee) {
        if (filters.assignee === "unassigned" && t.assignedTo) return false;
        if (filters.assignee !== "unassigned" && t.assignedTo?._id !== filters.assignee) return false;
      }
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.type && t.type !== filters.type) return false;
      if (filters.label && !(t.labels || []).includes(filters.label)) return false;
      if (filters.sprint) {
        if (filters.sprint === "backlog" && t.sprintId) return false;
        if (filters.sprint !== "backlog" && t.sprintId !== filters.sprint) return false;
      }
      return true;
    });
  }, [tasks, filters]);

  const sorted = useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1;
    const val = (t) => {
      switch (sort.field) {
        case "title": return (t.title || "").toLowerCase();
        case "type": return t.type || "";
        case "status": return columns.findIndex((c) => c.id === t.status);
        case "priority": return PRIORITY_ORDER[t.priority] ?? 9;
        case "points": return t.storyPoints ?? -1;
        case "assignee": return (t.assignedTo?.name || "").toLowerCase();
        case "due": return t.dueDate ? new Date(t.dueDate).getTime() : Infinity;
        case "sprint": return sprintName(t.sprintId).toLowerCase();
        default: return (t.key || "").toLowerCase();
      }
    };
    return [...filtered].sort((a, b) => {
      const av = val(a), bv = val(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sort, columns, sprints]);

  const toggleSort = (field) =>
    setSort((s) => (s.field === field ? { field, dir: s.dir === "asc" ? "desc" : "asc" } : { field, dir: "asc" }));

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const saveCurrent = async () => {
    const name = window.prompt("Name this filter:");
    if (!name?.trim()) return;
    try {
      await api.post("/api/filters", { name: name.trim(), criteria: filters });
      const { data } = await api.get("/api/filters");
      setSavedFilters(data);
      toast.success("Filter saved");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const deleteFilter = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/filters/${id}`);
      setSavedFilters((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const SortHead = ({ field, children, className = "" }) => (
    <th
      onClick={() => toggleSort(field)}
      className={`px-3 py-2 font-medium cursor-pointer select-none hover:text-ink ${className}`}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sort.field === field &&
          (sort.dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
      </span>
    </th>
  );

  if (!projectId) {
    return (
      <div className="bg-white rounded-lg p-12 border border-line text-center text-ink-subtle">
        Open a project from <span className="text-brand font-medium">Projects</span> to see its issue list.
      </div>
    );
  }

  return (
    <div>
      <ViewTabs projectId={projectId} />

      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <h1 className="text-xl font-semibold text-ink">
          List <span className="text-sm font-normal text-ink-subtle">· {sorted.length} issues</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleArchived}
            className={`flex items-center gap-1.5 text-xs border rounded px-2.5 py-1.5 transition-colors ${
              showArchived ? "border-brand text-brand bg-brand-tint" : "border-line text-ink-subtle hover:bg-gray-50"
            }`}
          >
            <Archive size={14} /> Archived
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 text-xs border border-line rounded px-2.5 py-1.5 text-ink-subtle hover:bg-gray-50"
          >
            <Download size={14} /> Export CSV
          </button>
          {canManage && (
            <>
              <button
                onClick={() => importRef.current?.click()}
                className="flex items-center gap-1.5 text-xs border border-line rounded px-2.5 py-1.5 text-ink-subtle hover:bg-gray-50"
              >
                <Upload size={14} /> Import CSV
              </button>
              <input ref={importRef} type="file" accept=".csv,text/csv" className="hidden" onChange={importCsv} />
            </>
          )}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3 bg-brand-tint border border-brand/30 rounded-lg px-3 py-2">
          <span className="text-xs font-semibold text-brand">{selected.size} selected</span>
          <select
            defaultValue=""
            onChange={(e) => e.target.value && applyBulk({ status: e.target.value })}
            className={selectClass}
          >
            <option value="">Set status…</option>
            {columns.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
          <select
            defaultValue=""
            onChange={(e) => e.target.value && applyBulk({ priority: e.target.value })}
            className={selectClass}
          >
            <option value="">Set priority…</option>
            {["critical", "high", "medium", "low"].map((p) => (<option key={p} value={p}>{p}</option>))}
          </select>
          <select
            defaultValue=""
            onChange={(e) => applyBulk({ assignedTo: e.target.value === "__unassign" ? "" : e.target.value })}
            className={selectClass}
          >
            <option value="">Assign to…</option>
            <option value="__unassign">Unassigned</option>
            {members.map((m) => (<option key={m._id} value={m._id}>{m.name}</option>))}
          </select>
          <button
            onClick={() => applyBulk({ archived: true })}
            className="text-xs text-ink-subtle hover:text-danger px-2 py-1.5"
          >
            Archive
          </button>
          <button onClick={clearSelection} className="text-xs text-ink-subtle hover:text-ink px-2 py-1.5 ml-auto">
            Clear
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search…"
            className={`${selectClass} pl-8 w-44`}
          />
        </div>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className={selectClass}>
          <option value="">Status</option>
          {columns.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
        <select value={filters.assignee} onChange={(e) => setFilters({ ...filters, assignee: e.target.value })} className={selectClass}>
          <option value="">Assignee</option>
          <option value="unassigned">Unassigned</option>
          {members.map((m) => (<option key={m._id} value={m._id}>{m.name}</option>))}
        </select>
        <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className={selectClass}>
          <option value="">Priority</option>
          {["critical", "high", "medium", "low"].map((p) => (<option key={p} value={p}>{p}</option>))}
        </select>
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className={selectClass}>
          <option value="">Type</option>
          {["task", "bug", "feature", "epic"].map((t) => (<option key={t} value={t}>{t}</option>))}
        </select>
        {labelOptions.length > 0 && (
          <select value={filters.label} onChange={(e) => setFilters({ ...filters, label: e.target.value })} className={selectClass}>
            <option value="">Label</option>
            {labelOptions.map((l) => (<option key={l} value={l}>{l}</option>))}
          </select>
        )}
        <select value={filters.sprint} onChange={(e) => setFilters({ ...filters, sprint: e.target.value })} className={selectClass}>
          <option value="">Sprint</option>
          <option value="backlog">Backlog</option>
          {sprints.map((s) => (<option key={s._id} value={s._id}>{s.name}</option>))}
        </select>
        {activeFilterCount > 0 && (
          <>
            <button onClick={() => setFilters(EMPTY)} className="inline-flex items-center gap-1 text-xs text-ink-subtle hover:text-danger px-2 py-1.5">
              <X size={13} /> Clear
            </button>
            <button onClick={saveCurrent} className="inline-flex items-center gap-1 text-xs text-brand hover:underline px-2 py-1.5 font-medium">
              <Save size={13} /> Save filter
            </button>
          </>
        )}
      </div>

      {/* Saved filters */}
      {savedFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="text-[11px] text-ink-subtle inline-flex items-center gap-1">
            <Star size={12} /> Saved:
          </span>
          {savedFilters.map((f) => (
            <button
              key={f._id}
              onClick={() => setFilters({ ...EMPTY, ...f.criteria })}
              className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-line text-xs text-ink-subtle hover:bg-brand-tint hover:text-brand hover:border-brand"
            >
              {f.name}
              <Trash2 size={11} className="opacity-0 group-hover:opacity-100 hover:text-danger" onClick={(e) => deleteFilter(f._id, e)} />
            </button>
          ))}
        </div>
      )}

      {/* Archived issues bin */}
      {showArchived && (
        <div className="mb-3 bg-white border border-line rounded-lg p-4">
          <h2 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
            <Archive size={15} className="text-ink-subtle" /> Archived issues ({archived.length})
          </h2>
          {archived.length === 0 ? (
            <p className="text-xs text-ink-subtle italic">No archived issues.</p>
          ) : (
            <div className="divide-y divide-line">
              {archived.map((t) => (
                <div key={t._id} className="flex items-center gap-2 py-2">
                  <TypeIcon type={t.type} />
                  <span className="text-[11px] font-medium text-ink-subtle flex-shrink-0">{t.key}</span>
                  <span className="text-sm text-ink flex-1 truncate">{t.title}</span>
                  <button
                    onClick={() => restoreTask(t)}
                    className="flex items-center gap-1 text-xs text-brand font-medium hover:underline"
                  >
                    <RotateCcw size={13} /> Restore
                  </button>
                  <button
                    onClick={() => purgeTask(t)}
                    className="p-1.5 rounded text-ink-subtle hover:bg-danger-tint hover:text-danger transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-line rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="text-left text-ink-subtle border-b border-line bg-canvas">
              <th className="px-3 py-2 w-8">
                <input
                  type="checkbox"
                  checked={sorted.length > 0 && sorted.every((t) => selected.has(t._id))}
                  onChange={() => toggleAll(sorted.map((t) => t._id))}
                  aria-label="Select all"
                />
              </th>
              <SortHead field="type" className="w-10">Type</SortHead>
              <SortHead field="key" className="w-24">Key</SortHead>
              <SortHead field="title">Summary</SortHead>
              <SortHead field="status">Status</SortHead>
              <SortHead field="assignee">Assignee</SortHead>
              <SortHead field="priority" className="w-16 text-center">Pri</SortHead>
              <SortHead field="points" className="w-14 text-center">Pts</SortHead>
              <SortHead field="sprint">Sprint</SortHead>
              <SortHead field="due">Due</SortHead>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={10} className="px-3 py-8 text-center text-ink-subtle">Loading…</td></tr>
            )}
            {!loading && sorted.length === 0 && (
              <tr><td colSpan={10} className="px-3 py-8 text-center text-ink-subtle">No issues match.</td></tr>
            )}
            {sorted.map((t) => (
              <tr
                key={t._id}
                onClick={() => navigate(`/browse/${t.key}`)}
                className={`border-b border-line last:border-0 hover:bg-canvas cursor-pointer ${
                  selected.has(t._id) ? "bg-brand-tint/40" : ""
                }`}
              >
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(t._id)}
                    onChange={() => toggleSelect(t._id)}
                    aria-label={`Select ${t.key}`}
                  />
                </td>
                <td className="px-3 py-2"><TypeIcon type={t.type} /></td>
                <td className="px-3 py-2 text-[11px] font-semibold text-ink-subtle">{t.key}</td>
                <td className="px-3 py-2 text-ink">{t.title}</td>
                <td className="px-3 py-2"><StatusLozenge status={t.status} label={statusName(t.status)} /></td>
                <td className="px-3 py-2">
                  {t.assignedTo ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Avatar name={t.assignedTo.name} size="xs" />
                      <span className="text-ink-subtle text-xs hidden md:inline">{t.assignedTo.name}</span>
                    </span>
                  ) : (
                    <span className="text-ink-subtle text-xs">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center"><PriorityIcon priority={t.priority} /></td>
                <td className="px-3 py-2 text-center"><StoryPoints points={t.storyPoints} /></td>
                <td className="px-3 py-2 text-xs text-ink-subtle">{t.sprintId ? sprintName(t.sprintId) : "Backlog"}</td>
                <td className="px-3 py-2 text-xs text-ink-subtle">{t.dueDate ? formatDate(t.dueDate) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
