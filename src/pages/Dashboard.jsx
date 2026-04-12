import { useEffect, useState } from "react";
import {
  Folder,
  CheckSquare,
  Users,
  Activity,
  TrendingUp,
  Clock,
  BarChart2,
} from "lucide-react";
import api from "../services/api";
import { AgentActivityPanel } from "../components/agent/AgentActivityPanel";

export const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    members: 0,
  });

  useEffect(() => {
    fetchStats();
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

  const cards = [
    {
      icon: Folder,
      label: "Total Projects",
      value: stats.projects,
      color: "from-blue-500 to-cyan-500",
      bg: "from-blue-50 to-cyan-50",
      border: "border-blue-200",
      textColor: "text-blue-700",
    },
    {
      icon: CheckSquare,
      label: "Active Tasks",
      value: stats.tasks,
      color: "from-green-500 to-emerald-500",
      bg: "from-green-50 to-emerald-50",
      border: "border-green-200",
      textColor: "text-green-700",
    },
    {
      icon: Users,
      label: "Team Members",
      value: stats.members,
      color: "from-purple-500 to-pink-500",
      bg: "from-purple-50 to-pink-50",
      border: "border-purple-200",
      textColor: "text-purple-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Track your team&apos;s progress and productivity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${card.bg} rounded-2xl shadow-lg p-6 border ${card.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`bg-gradient-to-br ${card.color} p-3 rounded-xl shadow-lg`}
              >
                <card.icon className="text-white" size={22} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${card.textColor}`}>
                <TrendingUp size={14} />
                <span>Active</span>
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                {card.label}
              </p>
              <p className="text-4xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section — Agent Activity (wider) + Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Activity — takes 1 column */}
        <div className="lg:col-span-1">
          <AgentActivityPanel />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 rounded-xl shadow-md">
              <Activity size={20} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {[
              { text: "No recent activity", sub: "Activity will appear here as tasks are updated." },
            ].map((item, i) => (
              <div key={i} className="text-center py-8 text-gray-400">
                <BarChart2 size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">{item.text}</p>
                <p className="text-xs mt-1">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="lg:col-span-1 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 rounded-xl shadow-md">
              <Clock size={20} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Upcoming Deadlines
            </h2>
          </div>
          <div className="text-center py-8 text-gray-400">
            <Clock size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No upcoming deadlines</p>
            <p className="text-xs mt-1">Deadlines from tasks will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
