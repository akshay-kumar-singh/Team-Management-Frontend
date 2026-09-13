import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Folder,
  CheckSquare,
  Users,
  Activity,
  Clock,
  BarChart2,
  Settings2,
  ChevronUp,
  ChevronDown,
  X,
  Plus,
  Inbox,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { AgentActivityPanel } from "../components/agent/AgentActivityPanel";
import { TypeIcon, DueDateChip } from "../components/common/TaskIcons";
import { formatRelativeTime } from "../utils/helpers";

const ALL_GADGETS = [
  { id: "stats", label: "Stats overview" },
  { id: "myissues", label: "Assigned to me" },
  { id: "deadlines", label: "Upcoming deadlines" },
  { id: "activity", label: "Recent activity" },
  { id: "agent", label: "AI agent activity" },
];
const DEFAULT_ORDER = ["stats", "deadlines", "activity", "agent"];
const KNOWN = new Set(ALL_GADGETS.map((g) => g.id));
const labelOf = (id) => ALL_GADGETS.find((g) => g.id === id)?.label || id;

// Turn a changelog entry into a human sentence.
const activityText = (a) => {
  const key = a.taskId?.key || "an issue";
  switch (a.field) {
    case "created": return `created ${key}`;
    case "status": return `moved ${key} to ${a.to}`;
    case "assignee": return a.to && a.to !== "Unassigned" ? `assigned ${key} to ${a.to}` : `unassigned ${key}`;
    case "logged work": return `logged ${a.to} on ${key}`;
    case "priority": return `set ${key} priority to ${a.to}`;
    case "story points": return `set ${key} points to ${a.to}`;
    case "comment": return `commented on ${key}`;
    default: return `updated ${a.field} on ${key}`;
  }
};

const Panel = ({ icon, title, children }) => {
  const Icon = icon;
  return (
    <div className="bg-white rounded-lg border border-line p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="bg-brand-tint p-2 rounded">
          <Icon size={16} className="text-brand" />
        </div>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </div>
  );
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { userData, refreshUser } = useAuth();

  const [stats, setStats] = useState({ projects: 0, tasks: 0, members: 0 });
  const [deadlines, setDeadlines] = useState([]);
  const [activity, setActivity] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [customizing, setCustomizing] = useState(false);
  const [draft, setDraft] = useState([]);

  const savedOrder = (userData?.dashboardGadgets || []).filter((id) => KNOWN.has(id));
  const order = savedOrder.length ? savedOrder : DEFAULT_ORDER;

  useEffect(() => {
    fetchStats();
    fetchDeadlines();
    fetchActivity();
  }, [userData?._id]);

  const fetchActivity = async () => {
    try {
      const { data } = await api.get("/api/reports/activity?limit=12");
      setActivity(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStats = async () => {
    try {
      // One aggregated call (server-side) replaces the old per-project N+1
      const { data } = await api.get("/api/stats/overview");
      setStats({ projects: data.projects, tasks: data.activeIssues, members: data.members });
      setMyIssues(data.assignedToMe);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDeadlines = async () => {
    try {
      const { data } = await api.get("/api/tasks/deadlines");
      setDeadlines(data);
    } catch (e) {
      console.error(e);
    }
  };

  // ── Customize ──
  const openCustomize = () => {
    setDraft(order);
    setCustomizing(true);
  };
  const move = (idx, dir) => {
    setDraft((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };
  const removeGadget = (id) => setDraft((prev) => prev.filter((g) => g !== id));
  const addGadget = (id) => setDraft((prev) => [...prev, id]);
  const saveLayout = async () => {
    try {
      await api.patch("/api/users/dashboard", { gadgets: draft });
      await refreshUser();
      setCustomizing(false);
    } catch (e) {
      console.error(e);
    }
  };

  const cards = [
    { icon: Folder, label: "Total Projects", value: stats.projects },
    { icon: CheckSquare, label: "Active Issues", value: stats.tasks },
    { icon: Users, label: "Team Members", value: stats.members },
  ];

  const renderGadget = (id) => {
    switch (id) {
      case "stats":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map((card, i) => (
              <div key={i} className="bg-white rounded-lg border border-line p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-brand-tint p-2 rounded"><card.icon className="text-brand" size={18} /></div>
                  <p className="text-ink-subtle text-sm font-medium">{card.label}</p>
                </div>
                <p className="text-3xl font-bold text-ink">{card.value}</p>
              </div>
            ))}
          </div>
        );
      case "agent":
        return <AgentActivityPanel />;
      case "myissues":
        return (
          <Panel icon={Inbox} title="Assigned to me">
            {myIssues.length === 0 ? (
              <p className="text-sm text-ink-subtle text-center py-6">Nothing assigned to you right now.</p>
            ) : (
              <div className="space-y-1">
                {myIssues.map((t) => (
                  <button key={t._id} onClick={() => t.key && navigate(`/browse/${t.key}`)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-50 text-left transition-colors">
                    <TypeIcon type={t.type} />
                    <span className="text-[11px] font-medium text-ink-subtle flex-shrink-0">{t.key}</span>
                    <span className="text-sm text-ink truncate flex-1">{t.title}</span>
                    {t.dueDate && <DueDateChip dueDate={t.dueDate} status={t.status} />}
                  </button>
                ))}
              </div>
            )}
          </Panel>
        );
      case "deadlines":
        return (
          <Panel icon={Clock} title="Upcoming Deadlines">
            {deadlines.length === 0 ? (
              <div className="text-center py-8 text-ink-subtle">
                <Clock size={30} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No upcoming deadlines</p>
                <p className="text-xs mt-1">Set due dates on tasks and they'll appear here.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {deadlines.map((t) => (
                  <button key={t._id} onClick={() => t.key && navigate(`/browse/${t.key}`)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-50 text-left transition-colors">
                    <TypeIcon type={t.type} />
                    {t.key && <span className="text-[11px] font-medium text-ink-subtle flex-shrink-0">{t.key}</span>}
                    <span className="text-sm text-ink truncate flex-1">{t.title}</span>
                    <DueDateChip dueDate={t.dueDate} status={t.status} />
                  </button>
                ))}
              </div>
            )}
          </Panel>
        );
      case "activity":
        return (
          <Panel icon={Activity} title="Recent Activity">
            {activity.length === 0 ? (
              <div className="text-center py-8 text-ink-subtle">
                <BarChart2 size={30} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No recent activity</p>
                <p className="text-xs mt-1">Activity will appear here as tasks are updated.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {activity.map((a) => (
                  <button key={a._id} onClick={() => a.taskId?.key && navigate(`/browse/${a.taskId.key}`)}
                    className="w-full flex items-start gap-2.5 text-left group">
                    <div className="w-6 h-6 rounded-full bg-brand-tint text-brand flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {(a.actorId?.name || "AI").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-ink leading-snug">
                        <span className="font-medium">{a.actorId?.name || "AI agent"}</span>{" "}
                        <span className="text-ink-subtle group-hover:text-ink transition-colors">{activityText(a)}</span>
                      </p>
                      <p className="text-[11px] text-ink-subtle mt-0.5">{formatRelativeTime(a.createdAt)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Panel>
        );
      default:
        return null;
    }
  };

  const available = ALL_GADGETS.filter((g) => !draft.includes(g.id));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-ink mb-0.5">Dashboard</h1>
          <p className="text-ink-subtle text-sm">Track your team's progress and productivity</p>
        </div>
        <button
          onClick={openCustomize}
          className="flex items-center gap-1.5 text-sm border border-line rounded px-3 py-1.5 text-ink-subtle hover:bg-gray-50"
        >
          <Settings2 size={15} /> Customize
        </button>
      </div>

      {/* Customize panel */}
      {customizing && (
        <div className="bg-white border border-line rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-ink">Customize dashboard</h2>
            <button onClick={() => setCustomizing(false)} className="text-ink-subtle hover:text-ink"><X size={16} /></button>
          </div>
          <div className="space-y-1.5 mb-3">
            {draft.map((id, idx) => (
              <div key={id} className="flex items-center gap-2 border border-line rounded px-3 py-1.5">
                <span className="text-sm text-ink flex-1">{labelOf(id)}</span>
                <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-1 text-ink-subtle disabled:opacity-30 hover:text-ink"><ChevronUp size={15} /></button>
                <button onClick={() => move(idx, 1)} disabled={idx === draft.length - 1} className="p-1 text-ink-subtle disabled:opacity-30 hover:text-ink"><ChevronDown size={15} /></button>
                <button onClick={() => removeGadget(id)} className="p-1 text-ink-subtle hover:text-danger"><X size={15} /></button>
              </div>
            ))}
          </div>
          {available.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {available.map((g) => (
                <button key={g.id} onClick={() => addGadget(g.id)}
                  className="inline-flex items-center gap-1 text-xs border border-line rounded-full px-2.5 py-1 text-ink-subtle hover:bg-brand-tint hover:text-brand">
                  <Plus size={12} /> {g.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button onClick={() => setCustomizing(false)} className="text-sm text-ink-subtle px-3 py-1.5">Cancel</button>
            <button onClick={saveLayout} className="text-sm bg-brand text-white px-4 py-1.5 rounded font-medium">Save layout</button>
          </div>
        </div>
      )}

      {/* Gadgets in the user's order — "stats" spans the full row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {order.map((id) => (
          <div key={id} className={id === "stats" ? "lg:col-span-2" : ""}>
            {renderGadget(id)}
          </div>
        ))}
      </div>
    </div>
  );
};
