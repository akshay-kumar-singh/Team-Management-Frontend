import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { BarChart3, TrendingDown, Layers, Gauge } from "lucide-react";
import api from "../services/api";
import { BurndownChart } from "../components/reports/BurndownChart";
import { VelocityChart } from "../components/reports/VelocityChart";
import { CFDChart } from "../components/reports/CFDChart";

const Card = ({ icon, title, subtitle, right, children }) => {
  const Icon = icon;
  return (
    <div className="bg-white rounded-lg border border-line p-5">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-brand-tint p-2 rounded">
            <Icon size={16} className="text-brand" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink">{title}</h2>
            {subtitle && <p className="text-xs text-ink-subtle mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
};

const selectClass =
  "text-xs border border-line rounded px-2 py-1.5 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-brand/30";

export const Reports = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const projectId = searchParams.get("projectId") || "";

  const [velocity, setVelocity] = useState({ series: [], averageVelocity: 0 });
  const [cfd, setCfd] = useState({ columns: [], series: [] });
  const [sprints, setSprints] = useState([]);
  const [sprintId, setSprintId] = useState("");
  const [burndown, setBurndown] = useState({ points: [], committedPoints: 0 });
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);

  // Load projects once; default to the first project
  useEffect(() => {
    api.get("/api/projects").then(({ data }) => {
      setProjects(data);
      if (!projectId && data[0]) setSearchParams({ projectId: data[0]._id }, { replace: true });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When project or day-span changes, refetch velocity, CFD and the sprint list
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([
      api.get(`/api/reports/velocity?projectId=${projectId}`),
      api.get(`/api/reports/cfd?projectId=${projectId}&days=${days}`),
      api.get(`/api/sprints?projectId=${projectId}`),
    ])
      .then(([v, c, s]) => {
        setVelocity(v.data);
        setCfd(c.data);
        setSprints(s.data);
        // Prefer the active sprint, else the most recent completed one
        const active = s.data.find((sp) => sp.status === "active");
        const lastDone = [...s.data].reverse().find((sp) => sp.status === "completed");
        setSprintId((active || lastDone || {})._id || "");
      })
      .finally(() => setLoading(false));
  }, [projectId, days]);

  const loadBurndown = useCallback(() => {
    if (!sprintId) {
      setBurndown({ points: [], committedPoints: 0 });
      return;
    }
    api.get(`/api/reports/burndown?sprintId=${sprintId}`).then(({ data }) => setBurndown(data));
  }, [sprintId]);

  useEffect(() => {
    loadBurndown();
  }, [loadBurndown]);

  const burndownSprints = sprints.filter((s) => s.status !== "future");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-ink mb-0.5">Reports</h1>
          <p className="text-ink-subtle text-sm">Velocity, burndown and cumulative flow for your project.</p>
        </div>
        <select
          value={projectId}
          onChange={(e) => setSearchParams({ projectId: e.target.value })}
          className={selectClass + " min-w-[180px]"}
        >
          {projects.length === 0 && <option value="">No projects</option>}
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.key ? `${p.key} · ${p.name}` : p.name}
            </option>
          ))}
        </select>
      </div>

      {!projectId ? (
        <div className="bg-white rounded-lg border border-line p-12 text-center text-ink-subtle">
          <BarChart3 size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Create a project to see reports.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-line border-t-brand rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <Card
            icon={TrendingDown}
            title="Sprint burndown"
            subtitle="Remaining committed points vs the ideal line"
            right={
              burndownSprints.length > 0 && (
                <select value={sprintId} onChange={(e) => setSprintId(e.target.value)} className={selectClass}>
                  {burndownSprints.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.status === "active" ? "(active)" : ""}
                    </option>
                  ))}
                </select>
              )
            }
          >
            <BurndownChart points={burndown.points} committedPoints={burndown.committedPoints} />
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card icon={Gauge} title="Velocity" subtitle="Committed vs completed points per sprint">
              <VelocityChart series={velocity.series} averageVelocity={velocity.averageVelocity} />
            </Card>

            <Card
              icon={Layers}
              title="Cumulative flow"
              subtitle="Issues in each column over time"
              right={
                <select value={days} onChange={(e) => setDays(Number(e.target.value))} className={selectClass}>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                </select>
              }
            >
              <CFDChart columns={cfd.columns} series={cfd.series} />
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
