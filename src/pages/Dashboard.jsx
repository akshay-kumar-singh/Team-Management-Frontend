import { useEffect, useState } from "react";
import {
  Folder,
  CheckSquare,
  Users,
  Activity,
  TrendingUp,
  Clock,
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

      // Fetch tasks for all projects
      let totalTasks = 0;
      if (projects.length > 0) {
        const taskRequests = projects.map((p) =>
          api.get(`/api/tasks?projectId=${p._id}`),
        );
        const taskResponses = await Promise.allSettled(taskRequests);
        taskResponses.forEach((res) => {
          if (res.status === "fulfilled") {
            // Only count tasks that are NOT done (active tasks)
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
      bg: "bg-blue-50",
    },
    {
      icon: CheckSquare,
      label: "Active Tasks", // (Todo + In Progress)
      value: stats.tasks,
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-50",
    },
    {
      icon: Users,
      label: "Team Members",
      value: stats.members,
      color: "from-purple-500 to-pink-500",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">
          Track your team's progress and productivity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`${card.bg} rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`bg-gradient-to-br ${card.color} p-3 rounded-xl shadow-lg`}
              >
                <card.icon className="text-white" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AgentActivityPanel />
        </div>

        <div className="lg:col-span-1 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
              <Activity size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>
          <p className="text-gray-600">Activity feed coming soon...</p>
        </div>

        <div className="lg:col-span-1 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
              <Clock size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Upcoming Deadlines
            </h2>
          </div>
          <p className="text-gray-600">No upcoming deadlines</p>
        </div>
      </div>
    </div>
  );
};
