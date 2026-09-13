import { NavLink } from "react-router-dom";
import { LayoutGrid, ListTodo, Table2, CalendarDays, GanttChartSquare } from "lucide-react";

const TABS = [
  { to: "tasks", label: "Board", icon: LayoutGrid },
  { to: "backlog", label: "Backlog", icon: ListTodo },
  { to: "list", label: "List", icon: Table2 },
  { to: "calendar", label: "Calendar", icon: CalendarDays },
  { to: "timeline", label: "Timeline", icon: GanttChartSquare },
];

/** Per-project view switcher (Board / Backlog / List / Calendar). */
export const ViewTabs = ({ projectId }) => {
  if (!projectId) return null;
  return (
    <div className="flex gap-1 border-b border-line mb-4 overflow-x-auto">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={`/${t.to}?projectId=${projectId}`}
          className={({ isActive }) =>
            `inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              isActive
                ? "border-brand text-brand"
                : "border-transparent text-ink-subtle hover:text-ink"
            }`
          }
        >
          <t.icon size={15} />
          {t.label}
        </NavLink>
      ))}
    </div>
  );
};
