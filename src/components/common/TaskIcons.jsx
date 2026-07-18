import {
  SquareCheck,
  Bug,
  Bookmark,
  ChevronUp,
  ChevronsUp,
  Equal,
  ChevronDown,
  CalendarDays,
} from "lucide-react";
import { format, isBefore, startOfDay, differenceInCalendarDays } from "date-fns";

// Jira-style issue type icon: task = blue check, bug = red, feature = green bookmark
export const TypeIcon = ({ type, size = 14 }) => {
  if (type === "bug") return <Bug size={size} className="text-danger flex-shrink-0" />;
  if (type === "feature") return <Bookmark size={size} className="text-success flex-shrink-0" />;
  return <SquareCheck size={size} className="text-brand flex-shrink-0" />;
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

export const StatusLozenge = ({ status, className = "" }) => {
  const lozenge = STATUS_LOZENGES[status] || STATUS_LOZENGES.todo;
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide ${lozenge.classes} ${className}`}
    >
      {lozenge.label}
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
export const DueDateChip = ({ dueDate, status, size = "xs" }) => {
  if (!dueDate) return null;

  const due = new Date(dueDate);
  const today = startOfDay(new Date());
  const isDone = status === "done";
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
