import { useMemo, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { Plus, LayoutGrid, Search, X, Settings2 } from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { Column } from "./Column";
import { TaskModal } from "./TaskModal";
import { BoardSettingsModal } from "./BoardSettingsModal";
import { Button } from "../common/Button";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { columnsOf, doneColumnId, SWIMLANE_OPTIONS } from "../../utils/constants";

const selectClass =
  "px-2.5 py-1.5 bg-white border border-line rounded text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand";

const EMPTY_FILTERS = { search: "", assignee: "", label: "", priority: "", type: "" };
const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0) || 0;

export const KanbanBoard = ({
  tasks = [],
  project,
  createTask,
  updateTask,
  deleteTask,
  reorderColumn,
  fetchTasks,
  onProjectUpdated,
}) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const { userData } = useAuth();
  const canManageBoard = ["ADMIN", "MANAGER"].includes(userData?.role);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [groupBy, setGroupBy] = useState("none");

  const columns = columnsOf(project);
  const doneStatus = doneColumnId(columns);
  const epics = useMemo(() => tasks.filter((t) => t.type === "epic"), [tasks]);

  // Epic roll-up from ALL tasks (before filtering) so counts stay truthful
  const epicProgressMap = useMemo(() => {
    const map = {};
    epics.forEach((e) => (map[e._id] = { done: 0, total: 0 }));
    tasks.forEach((t) => {
      const eid = t.epicId?._id || t.epicId;
      if (eid && map[eid]) {
        map[eid].total += 1;
        if (t.status === doneStatus) map[eid].done += 1;
      }
    });
    return map;
  }, [tasks, epics, doneStatus]);

  const assigneeOptions = useMemo(() => {
    const seen = new Map();
    tasks.forEach((t) => t.assignedTo?._id && seen.set(t.assignedTo._id, t.assignedTo.name));
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
        if (filters.assignee !== "unassigned" && t.assignedTo?._id !== filters.assignee) return false;
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

  // Manual ranking only applies to the plain, ungrouped, unfiltered board —
  // otherwise a persisted order would be computed from a partial view
  const canRank = groupBy === "none" && activeFilterCount === 0;

  // Swimlanes: group the filtered tasks into lanes
  const lanes = useMemo(() => {
    if (groupBy === "none") return null;
    const map = new Map();
    const add = (key, label, task) => {
      if (!map.has(key)) map.set(key, { id: key, label, tasks: [] });
      map.get(key).tasks.push(task);
    };
    filteredTasks.forEach((t) => {
      if (groupBy === "assignee") add(t.assignedTo?._id || "unassigned", t.assignedTo?.name || "Unassigned", t);
      else if (groupBy === "epic")
        add(t.epicId?._id || t.epicId || "no-epic", t.epicId?.key ? `${t.epicId.key} · ${t.epicId.title || ""}` : "No epic", t);
      else if (groupBy === "priority") add(t.priority || "medium", `${t.priority || "medium"} priority`, t);
    });
    const arr = [...map.values()];
    if (groupBy === "priority") arr.sort((a, b) => (PRIORITY_ORDER[a.id] ?? 9) - (PRIORITY_ORDER[b.id] ?? 9));
    else arr.sort((a, b) => a.label.localeCompare(b.label));
    return arr;
  }, [groupBy, filteredTasks]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, source, destination } = result;
    const task = tasks.find((t) => t._id === draggableId);
    if (!task) return;

    // Parse droppableId ("colId" ungrouped, "lane::colId" grouped)
    const destCol = destination.droppableId.includes("::")
      ? destination.droppableId.split("::")[1]
      : destination.droppableId;

    if (canRank) {
      if (source.droppableId === destCol && source.index === destination.index) return;
      const colTasks = filteredTasks.filter((t) => t.status === destCol && t._id !== draggableId).sort(byOrder);
      const orderedIds = [
        ...colTasks.slice(0, destination.index).map((t) => t._id),
        draggableId,
        ...colTasks.slice(destination.index).map((t) => t._id),
      ];
      reorderColumn(destCol, orderedIds, draggableId).catch(() => {});
    } else if (task.status !== destCol) {
      // Grouped/filtered: only the column (status) change is persisted
      updateTask(draggableId, {
        status: destCol,
        assignedTo: task.assignedTo?._id || task.assignedTo || null,
      }).catch(() => {});
    }
  };

  const handleSubmit = async (data) => {
    if (selectedTask) await updateTask(selectedTask._id, data);
    else await createTask(data);
    setSelectedTask(null);
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) await deleteTask(id);
  };

  const handleSaveBoard = async (config) => {
    const { data } = await api.put(`/api/projects/${projectId}/board`, config);
    onProjectUpdated?.(data);
    toast.success("Board updated");
    await fetchTasks?.();
  };

  const columnTasks = (list, colId) => list.filter((t) => t.status === colId).sort(byOrder);

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

  const renderColumns = (laneTasks, lanePrefix = "") =>
    columns.map((column) => {
      // Suppress WIP highlight inside swimlanes (a lane holds only part of the column)
      const col = lanePrefix ? { ...column, wipLimit: null } : column;
      return (
        <Column
          key={column.id}
          column={col}
          droppableId={lanePrefix ? `${lanePrefix}::${column.id}` : column.id}
          tasks={columnTasks(laneTasks, column.id)}
          onEditTask={handleEdit}
          onDeleteTask={handleDelete}
          epicProgressMap={epicProgressMap}
          doneStatus={doneStatus}
        />
      );
    });

  const gridStyle = { gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` };
  const minWidth = { minWidth: `${columns.length * 180}px` };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">Board</h1>
          <p className="text-xs text-ink-subtle mt-0.5">
            {activeFilterCount > 0 ? `${filteredTasks.length} of ${tasks.length} issues` : `${tasks.length} issues`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canManageBoard && (
            <Button variant="secondary" onClick={() => setIsSettingsOpen(true)}>
              <Settings2 size={15} className="mr-1" /> Board
            </Button>
          )}
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={16} className="mr-1" /> Create
          </Button>
        </div>
      </div>

      {/* Filter / group bar */}
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

        <select value={filters.assignee} onChange={(e) => setFilters({ ...filters, assignee: e.target.value })} className={selectClass}>
          <option value="">Assignee</option>
          <option value="unassigned">Unassigned</option>
          {assigneeOptions.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>

        {labelOptions.length > 0 && (
          <select value={filters.label} onChange={(e) => setFilters({ ...filters, label: e.target.value })} className={selectClass}>
            <option value="">Label</option>
            {labelOptions.map((l) => (<option key={l} value={l}>{l}</option>))}
          </select>
        )}

        <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className={selectClass}>
          <option value="">Priority</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className={selectClass}>
          <option value="">Type</option>
          <option value="task">Task</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature</option>
          <option value="epic">Epic</option>
        </select>

        <div className="w-px h-5 bg-line mx-1" />

        <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className={selectClass} title="Swimlanes">
          {SWIMLANE_OPTIONS.map((o) => (<option key={o.id} value={o.id}>{o.label}</option>))}
        </select>

        {activeFilterCount > 0 && (
          <button onClick={() => setFilters(EMPTY_FILTERS)} className="inline-flex items-center gap-1 text-xs text-ink-subtle hover:text-danger px-2 py-1.5">
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {!canRank && (
        <p className="text-[11px] text-ink-subtle mb-2">
          Manual card ranking is paused while {groupBy !== "none" ? "swimlanes are on" : "filters are active"} — drag still changes status.
        </p>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto pb-4">
          {lanes === null ? (
            <div className="grid gap-4" style={{ ...gridStyle, ...minWidth }}>
              {renderColumns(filteredTasks)}
            </div>
          ) : (
            <div className="space-y-3" style={minWidth}>
              {lanes.map((lane) => (
                <div key={lane.id} className="bg-white/60 rounded-lg border border-line p-2">
                  <div className="flex items-center gap-2 px-2 py-1 mb-1">
                    <h3 className="text-xs font-semibold text-ink capitalize">{lane.label}</h3>
                    <span className="text-[11px] text-ink-subtle">{lane.tasks.length}</span>
                  </div>
                  <div className="grid gap-4" style={gridStyle}>
                    {renderColumns(lane.tasks, lane.id)}
                  </div>
                </div>
              ))}
              {lanes.length === 0 && (
                <p className="text-sm text-ink-subtle italic px-2 py-6">No issues match.</p>
              )}
            </div>
          )}
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
        columns={columns}
      />

      <BoardSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        project={project}
        onSave={handleSaveBoard}
      />
    </div>
  );
};
