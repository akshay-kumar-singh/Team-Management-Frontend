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
      const [projects, tasks, members] = await Promise.all([
        api.get("/api/projects"),
        api.get("/api/tasks"),
        api.get("/api/users/team"),
      ]);

      setStats({
        projects: projects.data.length,
        tasks: tasks.data.length,
        members: members.data.length,
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
      label: "Active Tasks",
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
              <Activity size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>
          <p className="text-gray-600">Activity feed coming soon...</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 border border-blue-200">
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
