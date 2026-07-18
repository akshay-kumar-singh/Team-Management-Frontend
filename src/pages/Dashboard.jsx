import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Folder,
  CheckSquare,
  Users,
  Activity,
  Clock,
  BarChart2,
} from "lucide-react";
import api from "../services/api";
import { AgentActivityPanel } from "../components/agent/AgentActivityPanel";
import { TypeIcon, DueDateChip } from "../components/common/TaskIcons";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    members: 0,
  });
  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchDeadlines();
  }, []);

  const fetchStats = async () => {
    try {
      const [projectsRes, membersRes] = await Promise.all([
        api.get("/api/projects"),
        api.get("/api/users/team"),
      ]);

      const projects = projectsRes.data;

      let totalTasks = 0;
      if (projects.length > 0) {
        const taskRequests = projects.map((p) =>
          api.get(`/api/tasks?projectId=${p._id}`),
        );
        const taskResponses = await Promise.allSettled(taskRequests);
        taskResponses.forEach((res) => {
          if (res.status === "fulfilled") {
            const activeTasks = res.value.data.filter(
              (t) => t.status !== "done",
            );
            totalTasks += activeTasks.length;
          }
        });
      }

      setStats({
        projects: projects.length,
        tasks: totalTasks,
        members: membersRes.data.length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchDeadlines = async () => {
    try {
      const { data } = await api.get("/api/tasks/deadlines");
      setDeadlines(data);
    } catch (error) {
      console.error("Error fetching deadlines:", error);
    }
  };

  const cards = [
    { icon: Folder, label: "Total Projects", value: stats.projects },
    { icon: CheckSquare, label: "Active Issues", value: stats.tasks },
    { icon: Users, label: "Team Members", value: stats.members },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-ink mb-0.5">
          Dashboard
        </h1>
        <p className="text-ink-subtle text-sm">
          Track your team's progress and productivity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg border border-line p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-brand-tint p-2 rounded">
                <card.icon className="text-brand" size={18} />
              </div>
              <p className="text-ink-subtle text-sm font-medium">{card.label}</p>
            </div>
            <p className="text-3xl font-bold text-ink">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Agent Activity */}
        <div className="lg:col-span-1">
          <AgentActivityPanel />
        </div>

        {/* Upcoming Deadlines — real data */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-line p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="bg-brand-tint p-2 rounded">
              <Clock size={16} className="text-brand" />
            </div>
            <h2 className="text-sm font-semibold text-ink">Upcoming Deadlines</h2>
          </div>

          {deadlines.length === 0 ? (
            <div className="text-center py-8 text-ink-subtle">
              <Clock size={30} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No upcoming deadlines</p>
              <p className="text-xs mt-1">
                Set due dates on tasks and they'll appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {deadlines.map((t) => (
                <button
                  key={t._id}
                  onClick={() => t.key && navigate(`/browse/${t.key}`)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-50 text-left transition-colors"
                >
                  <TypeIcon type={t.type} />
                  {t.key && (
                    <span className="text-[11px] font-medium text-ink-subtle flex-shrink-0">
                      {t.key}
                    </span>
                  )}
                  <span className="text-sm text-ink truncate flex-1">
                    {t.title}
                  </span>
                  <DueDateChip dueDate={t.dueDate} status={t.status} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity — real feed lands in Phase 7 */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-line p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="bg-brand-tint p-2 rounded">
              <Activity size={16} className="text-brand" />
            </div>
            <h2 className="text-sm font-semibold text-ink">Recent Activity</h2>
          </div>
          <div className="text-center py-8 text-ink-subtle">
            <BarChart2 size={30} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No recent activity</p>
            <p className="text-xs mt-1">
              Activity will appear here as tasks are updated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
