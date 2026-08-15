import { useMemo, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { Plus, LayoutGrid, Search, X } from "lucide-react";
import { Column } from "./Column";
import { TaskModal } from "./TaskModal";
import { Button } from "../common/Button";
import { TASK_COLUMNS } from "../../utils/constants";
import { useSearchParams } from "react-router-dom";

const selectClass =
  "px-2.5 py-1.5 bg-white border border-line rounded text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand";

const EMPTY_FILTERS = { search: "", assignee: "", label: "", priority: "", type: "" };

export const KanbanBoard = ({ tasks = [], createTask, updateTask, deleteTask }) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const epics = useMemo(() => tasks.filter((t) => t.type === "epic"), [tasks]);

  // Roll-up progress per epic, computed from ALL tasks (before filtering) so
  // an epic card always shows its true completion
  const epicProgressMap = useMemo(() => {
    const map = {};
    epics.forEach((e) => (map[e._id] = { done: 0, total: 0 }));
    tasks.forEach((t) => {
      const eid = t.epicId?._id || t.epicId;
      if (eid && map[eid]) {
        map[eid].total += 1;
        if (t.status === "done") map[eid].done += 1;
      }
    });
    return map;
  }, [tasks, epics]);

  // Distinct options for the quick filters, derived from the loaded tasks
  const assigneeOptions = useMemo(() => {
    const seen = new Map();
    tasks.forEach((t) => {
      if (t.assignedTo?._id) seen.set(t.assignedTo._id, t.assignedTo.name);
    });
    return [...seen.entries()];
  }, [tasks]);

  const labelOptions = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => (t.labels || []).forEach((l) => set.add(l)));
    return [...set].sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (q && !`${t.key} ${t.title}`.toLowerCase().includes(q)) return false;
      if (filters.assignee) {
        if (filters.assignee === "unassigned" && t.assignedTo) return false;
        if (filters.assignee !== "unassigned" && t.assignedTo?._id !== filters.assignee)
          return false;
      }
      if (filters.label && !(t.labels || []).includes(filters.label)) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.type && t.type !== filters.type) return false;
      return true;
    });
  }, [tasks, filters]);

  const activeFilterCount =
    (filters.assignee ? 1 : 0) +
    (filters.label ? 1 : 0) +
    (filters.priority ? 1 : 0) +
    (filters.type ? 1 : 0) +
    (filters.search ? 1 : 0);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const task = tasks.find((t) => t._id === draggableId);
    if (task && task.status !== destination.droppableId) {
      await updateTask(draggableId, {
        status: destination.droppableId,
        assignedTo: task.assignedTo?._id || task.assignedTo || null,
      });
    }
  };

  const handleSubmit = async (data) => {
    if (selectedTask) {
      await updateTask(selectedTask._id, data);
    } else {
      await createTask(data);
    }
    setSelectedTask(null);
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTask(id);
    }
  };

  if (!projectId) {
    return (
      <div className="bg-white rounded-lg p-12 border border-line text-center">
        <LayoutGrid size={40} className="mx-auto mb-4 text-ink-subtle opacity-40" />
        <h3 className="text-base font-semibold text-ink mb-1">No project selected</h3>
        <p className="text-ink-subtle text-sm">
          Go to <span className="font-medium text-brand">Projects</span> and click a project to view its board.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">Board</h1>
          <p className="text-xs text-ink-subtle mt-0.5">
            {activeFilterCount > 0
              ? `${filteredTasks.length} of ${tasks.length} issues`
              : `${tasks.length} issues`}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} className="mr-1" /> Create
        </Button>
      </div>

      {/* Filter / search bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search key or title..."
            className={`${selectClass} pl-8 w-52`}
          />
        </div>

        <select
          value={filters.assignee}
          onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
          className={selectClass}
        >
          <option value="">Assignee</option>
          <option value="unassigned">Unassigned</option>
          {assigneeOptions.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>

        {labelOptions.length > 0 && (
          <select
            value={filters.label}
            onChange={(e) => setFilters({ ...filters, label: e.target.value })}
            className={selectClass}
          >
            <option value="">Label</option>
            {labelOptions.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        )}

        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className={selectClass}
        >
          <option value="">Priority</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className={selectClass}
        >
          <option value="">Type</option>
          <option value="task">Task</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature</option>
          <option value="epic">Epic</option>
        </select>

        {activeFilterCount > 0 && (
          <button
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="inline-flex items-center gap-1 text-xs text-ink-subtle hover:text-danger px-2 py-1.5"
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Horizontally scrollable on mobile, grid on larger screens */}
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-4 gap-4 min-w-[720px]">
            {TASK_COLUMNS.map((column) => (
              <Column
                key={column.id}
                column={column}
                tasks={filteredTasks.filter((t) => t.status === column.id)}
                onEditTask={handleEdit}
                onDeleteTask={handleDelete}
                epicProgressMap={epicProgressMap}
              />
            ))}
          </div>
        </div>
      </DragDropContext>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleSubmit}
        task={selectedTask}
        epics={epics}
      />
    </div>
  );
};
