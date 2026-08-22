import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
} from "date-fns";
import toast from "react-hot-toast";
import api from "../services/api";
import { ViewTabs } from "../components/common/ViewTabs";
import { columnsOf, doneColumnId } from "../utils/constants";

const TYPE_DOT = {
  bug: "bg-danger",
  feature: "bg-success",
  epic: "bg-purple-500",
  task: "bg-brand",
};

export const CalendarView = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [cursor, setCursor] = useState(startOfMonth(new Date()));

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get("/api/projects"),
        api.get(`/api/tasks?projectId=${projectId}&all=true`),
      ]);
      setProject(projRes.data.find((p) => p._id === projectId) || null);
      setTasks(taskRes.data);
    } catch (e) {
      toast.error(e.message);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const doneStatus = doneColumnId(columnsOf(project));

  // Map yyyy-MM-dd → tasks due that day
  const byDay = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const key = format(new Date(t.dueDate), "yyyy-MM-dd");
      (map[key] ||= []).push(t);
    });
    return map;
  }, [tasks]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const withDue = tasks.filter((t) => t.dueDate).length;

  if (!projectId) {
    return (
      <div className="bg-white rounded-lg p-12 border border-line text-center text-ink-subtle">
        Open a project from <span className="text-brand font-medium">Projects</span> to see its calendar.
      </div>
    );
  }

  return (
    <div>
      <ViewTabs projectId={projectId} />

      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold text-ink">
          {format(cursor, "MMMM yyyy")}{" "}
          <span className="text-sm font-normal text-ink-subtle">· {withDue} with due dates</span>
        </h1>
        <div className="flex items-center gap-1">
          <button onClick={() => setCursor(startOfMonth(new Date()))} className="px-2.5 py-1.5 text-xs font-medium border border-line rounded hover:bg-canvas">
            Today
          </button>
          <button onClick={() => setCursor(addMonths(cursor, -1))} className="p-1.5 border border-line rounded hover:bg-canvas">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setCursor(addMonths(cursor, 1))} className="p-1.5 border border-line rounded hover:bg-canvas">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-line rounded-lg overflow-hidden">
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b border-line bg-canvas">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="px-2 py-2 text-[11px] font-bold uppercase tracking-wide text-ink-subtle text-center">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const items = byDay[key] || [];
            const inMonth = isSameMonth(day, cursor);
            const today = isSameDay(day, new Date());
            return (
              <div
                key={key}
                className={`min-h-[104px] border-b border-r border-line p-1.5 ${
                  inMonth ? "bg-white" : "bg-canvas/50"
                }`}
              >
                <div
                  className={`text-[11px] font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    today ? "bg-brand text-white" : inMonth ? "text-ink" : "text-ink-subtle"
                  }`}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {items.slice(0, 3).map((t) => {
                    const done = t.status === doneStatus;
                    return (
                      <button
                        key={t._id}
                        onClick={() => navigate(`/browse/${t.key}`)}
                        title={`${t.key} · ${t.title}`}
                        className={`w-full flex items-center gap-1 px-1 py-0.5 rounded text-[10px] text-left hover:bg-canvas ${
                          done ? "opacity-50 line-through" : ""
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${TYPE_DOT[t.type] || TYPE_DOT.task}`} />
                        <span className="truncate text-ink">{t.key}</span>
                      </button>
                    );
                  })}
                  {items.length > 3 && (
                    <div className="text-[10px] text-ink-subtle px-1">+{items.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
