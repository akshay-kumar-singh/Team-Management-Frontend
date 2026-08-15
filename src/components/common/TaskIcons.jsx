import {
  SquareCheck,
  Bug,
  Bookmark,
  Zap,
  ChevronUp,
  ChevronsUp,
  Equal,
  ChevronDown,
  CalendarDays,
} from "lucide-react";
import { format, isBefore, startOfDay, differenceInCalendarDays } from "date-fns";
import { labelColor } from "../../utils/constants";

// Jira-style issue type icon: task = blue check, bug = red, feature = green bookmark, epic = purple bolt
export const TypeIcon = ({ type, size = 14 }) => {
  if (type === "bug") return <Bug size={size} className="text-danger flex-shrink-0" />;
  if (type === "feature") return <Bookmark size={size} className="text-success flex-shrink-0" />;
  if (type === "epic") return <Zap size={size} className="text-purple-600 flex-shrink-0" />;
  return <SquareCheck size={size} className="text-brand flex-shrink-0" />;
};

// A single label/tag chip with a color derived from its text
export const LabelChip = ({ label, size = "xs" }) => (
  <span
    className={`inline-flex items-center rounded font-medium ${labelColor(label)} ${
      size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
    }`}
  >
    {label}
  </span>
);

// Story-point estimate badge (Jira shows a small grey pill)
export const StoryPoints = ({ points, size = "xs" }) => {
  if (points === null || points === undefined || points === "") return null;
  return (
    <span
      title={`${points} story point${points === 1 ? "" : "s"}`}
      className={`inline-flex items-center justify-center rounded-full bg-gray-200 text-ink-subtle font-semibold ${
        size === "xs" ? "min-w-[18px] h-[18px] px-1 text-[10px]" : "min-w-[22px] h-[22px] px-1.5 text-xs"
      }`}
    >
      {points}
    </span>
  );
};

// Roll-up progress bar for epics / subtask groups
export const ProgressBar = ({ done = 0, total = 0, className = "" }) => {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className={className}>
      <div className="flex items-center justify-between text-[11px] text-ink-subtle mb-1">
        <span>{total ? `${done} of ${total} done` : "No child issues yet"}</span>
        {total > 0 && <span className="font-semibold">{pct}%</span>}
      </div>
      <div className="h-1.5 bg-column rounded-full overflow-hidden">
        <div
          className="h-full bg-success rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// Jira-style priority arrows
export const PriorityIcon = ({ priority, size = 14 }) => {
  if (priority === "critical")
    return <ChevronsUp size={size} className="text-danger flex-shrink-0" />;
  if (priority === "high")
    return <ChevronUp size={size} className="text-orange-600 flex-shrink-0" />;
  if (priority === "low")
    return <ChevronDown size={size} className="text-success flex-shrink-0" />;
  return <Equal size={size} className="text-warn flex-shrink-0" />;
};

const STATUS_LOZENGES = {
  todo: { label: "TO DO", classes: "bg-gray-200 text-gray-700" },
  "in-progress": { label: "IN PROGRESS", classes: "bg-brand-tint text-brand" },
  "in-review": { label: "IN REVIEW", classes: "bg-purple-100 text-purple-700" },
  done: { label: "DONE", classes: "bg-success-tint text-success" },
};

export const StatusLozenge = ({ status, label, className = "" }) => {
  // Known default statuses keep their colors; custom columns get a neutral
  // lozenge showing the provided label (or the id) so nothing renders blank
  const known = STATUS_LOZENGES[status];
  const classes = known?.classes || "bg-gray-200 text-gray-700";
  const text = known?.label || (label || status || "").toUpperCase();
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide ${classes} ${className}`}
    >
      {text}
    </span>
  );
};

export const Avatar = ({ name, size = "sm" }) => {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const sizes = {
    xs: "w-5 h-5 text-[9px]",
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
  };
  return (
    <span
      title={name}
      className={`${sizes[size] || sizes.sm} bg-brand text-white rounded-full inline-flex items-center justify-center font-semibold flex-shrink-0`}
    >
      {initials}
    </span>
  );
};

// Due-date chip: red when overdue, amber when due within 3 days, gray otherwise
export const DueDateChip = ({ dueDate, status, isDone: isDoneProp, size = "xs" }) => {
  if (!dueDate) return null;

  const due = new Date(dueDate);
  const today = startOfDay(new Date());
  // Prefer an explicit isDone (custom-column boards); fall back to the default id
  const isDone = isDoneProp !== undefined ? isDoneProp : status === "done";
  const overdue = !isDone && isBefore(due, today);
  const dueSoon =
    !isDone && !overdue && differenceInCalendarDays(due, today) <= 3;

  const classes = overdue
    ? "bg-danger-tint text-danger"
    : dueSoon
    ? "bg-warn-tint text-warn"
    : "bg-gray-100 text-ink-subtle";

  return (
    <span
      title={overdue ? "Overdue" : "Due date"}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-medium ${classes} ${
        size === "xs" ? "text-[10px]" : "text-xs"
      }`}
    >
      <CalendarDays size={size === "xs" ? 10 : 12} />
      {overdue ? "Overdue · " : ""}
      {format(due, "MMM dd")}
    </span>
  );
};
