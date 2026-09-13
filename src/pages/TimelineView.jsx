import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  startOfMonth,
  endOfMonth,
  addMonths,
  eachMonthOfInterval,
  differenceInCalendarDays,
  format,
} from "date-fns";
import api from "../services/api";
import { ViewTabs } from "../components/common/ViewTabs";
import { TypeIcon } from "../components/common/TaskIcons";

const TYPE_BAR = {
  epic: "#5243AA",
  bug: "#DE350B",
  feature: "#00875A",
  task: "#0052CC",
};

const d = (v) => (v ? new Date(v) : null);
const min = (arr) => arr.reduce((a, b) => (a && a < b ? a : b), null);
const max = (arr) => arr.reduce((a, b) => (a && a > b ? a : b), null);

export const TimelineView = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      const { data } = await api.get(`/api/tasks?projectId=${projectId}&all=true`);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  // Build Gantt rows: each epic (with its date range derived from children when
  // it has none), followed by that epic's dated child issues.
  const rows = useMemo(() => {
    const epics = tasks.filter((t) => t.type === "epic");
    const out = [];
    for (const epic of epics) {
      const children = tasks.filter((t) => (t.epicId?._id || t.epicId) === epic._id);
      const childStarts = children.map((c) => d(c.startDate)).filter(Boolean);
      const childEnds = children.map((c) => d(c.dueDate)).filter(Boolean);
      const start = d(epic.startDate) || min(childStarts);
      const end = d(epic.dueDate) || max(childEnds);
      out.push({ task: epic, start, end, depth: 0 });
      children
        .filter((c) => c.startDate || c.dueDate)
        .forEach((c) => out.push({ task: c, start: d(c.startDate) || d(c.dueDate), end: d(c.dueDate) || d(c.startDate), depth: 1 }));
    }
    // Dated issues with no epic
    const orphans = tasks.filter(
      (t) => t.type !== "epic" && !(t.epicId?._id || t.epicId) && (t.startDate || t.dueDate)
    );
    orphans.forEach((c) =>
      out.push({ task: c, start: d(c.startDate) || d(c.dueDate), end: d(c.dueDate) || d(c.startDate), depth: 0 })
    );
    return out.filter((r) => r.start || r.end);
  }, [tasks]);

  // Time domain, padded to whole months
  const { domainStart, domainEnd, months } = useMemo(() => {
    const starts = rows.map((r) => r.start).filter(Boolean);
    const ends = rows.map((r) => r.end).filter(Boolean);
    let lo = min(starts) || new Date();
    let hi = max(ends) || addMonths(new Date(), 2);
    lo = startOfMonth(lo);
    hi = endOfMonth(hi < lo ? addMonths(lo, 2) : hi);
    return { domainStart: lo, domainEnd: hi, months: eachMonthOfInterval({ start: lo, end: hi }) };
  }, [rows]);

  const totalDays = Math.max(1, differenceInCalendarDays(domainEnd, domainStart) + 1);
  const pct = (date) => (differenceInCalendarDays(date, domainStart) / totalDays) * 100;
  const today = new Date();

  if (!projectId) {
    return (
      <div className="bg-white rounded-lg p-12 border border-line text-center text-ink-subtle">
        Open a project to see its timeline.
      </div>
    );
  }

  return (
    <div>
      <ViewTabs projectId={projectId} />
      <h1 className="text-xl font-semibold text-ink mb-3">
        Timeline <span className="text-sm font-normal text-ink-subtle">· epics & scheduled work</span>
      </h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-line border-t-brand rounded-full animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-lg p-12 border border-line text-center text-ink-subtle">
          <p className="text-sm font-medium text-ink">Nothing to schedule yet</p>
          <p className="text-xs mt-1">Add start/due dates to epics or issues and they'll chart here.</p>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-lg overflow-x-auto">
          <div className="min-w-[720px]">
            {/* Month header */}
            <div className="flex border-b border-line bg-canvas">
              <div className="w-52 flex-shrink-0 px-3 py-2 text-xs font-semibold text-ink-subtle">Issue</div>
              <div className="flex-1 relative h-8">
                {months.map((m) => (
                  <div
                    key={m.toISOString()}
                    className="absolute top-0 h-8 border-l border-line text-[11px] text-ink-subtle px-1.5 py-2"
                    style={{ left: `${pct(m)}%` }}
                  >
                    {format(m, "MMM yy")}
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            <div className="relative">
              {/* Today marker — an overlay aligned to the track column (left of it
                  is the 13rem label gutter), positioned by percent inside it */}
              {today >= domainStart && today <= domainEnd && (
                <div className="absolute top-0 bottom-0 z-10 pointer-events-none" style={{ left: "13rem", right: 0 }}>
                  <div className="absolute top-0 bottom-0 w-px bg-danger/60" style={{ left: `${pct(today)}%` }} title="Today" />
                </div>
              )}
              {rows.map((r, i) => {
                const start = r.start || r.end;
                const end = r.end || r.start;
                const left = Math.max(0, pct(start));
                const width = Math.max(1.5, pct(end) - pct(start) + 100 / totalDays);
                return (
                  <div key={`${r.task._id}-${i}`} className="flex items-center border-b border-line last:border-0 hover:bg-canvas">
                    <button
                      onClick={() => navigate(`/browse/${r.task.key}`)}
                      className={`w-52 flex-shrink-0 px-3 py-2 flex items-center gap-1.5 text-left ${r.depth ? "pl-7" : ""}`}
                    >
                      <TypeIcon type={r.task.type} />
                      <span className="text-[11px] font-medium text-ink-subtle flex-shrink-0">{r.task.key}</span>
                      <span className="text-xs text-ink truncate">{r.task.title}</span>
                    </button>
                    <div className="flex-1 relative h-9">
                      <button
                        onClick={() => navigate(`/browse/${r.task.key}`)}
                        className="absolute top-1/2 -translate-y-1/2 h-4 rounded-full hover:opacity-80"
                        style={{
                          left: `${left}%`,
                          width: `${Math.min(width, 100 - left)}%`,
                          background: TYPE_BAR[r.task.type] || TYPE_BAR.task,
                          opacity: r.depth ? 0.65 : 1,
                        }}
                        title={`${r.task.key}: ${start ? format(start, "MMM d") : "?"} – ${end ? format(end, "MMM d") : "?"}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
