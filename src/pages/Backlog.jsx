import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import { Plus, LayoutGrid, FileBarChart } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useSprints } from "../hooks/useSprints";
import { SprintSection } from "../components/sprints/SprintSection";
import { CompleteSprintModal } from "../components/sprints/CompleteSprintModal";
import { SprintReportModal } from "../components/sprints/SprintReportModal";
import { Button } from "../components/common/Button";
import { columnsOf, doneColumnId } from "../utils/constants";

export const Backlog = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const {
    sprints,
    tasks,
    loading,
    createSprint,
    startSprint,
    completeSprint,
    deleteSprint,
    moveTasks,
    quickAdd,
  } = useSprints(projectId);

  const [project, setProject] = useState(null);
  const [reportSprint, setReportSprint] = useState(null);
  const [completingSprint, setCompletingSprint] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    api
      .get("/api/projects")
      .then(({ data }) => setProject(data.find((p) => p._id === projectId) || null))
      .catch(() => {});
  }, [projectId]);

  if (!projectId) {
    return (
      <div className="bg-white rounded-lg p-12 border border-line text-center">
        <LayoutGrid size={40} className="mx-auto mb-4 text-ink-subtle opacity-40" />
        <h3 className="text-base font-semibold text-ink mb-1">No project selected</h3>
        <p className="text-ink-subtle text-sm">
          Open a project from <span className="font-medium text-brand">Projects</span> to plan its backlog.
        </p>
      </div>
    );
  }

  const columns = columnsOf(project);
  const doneStatus = doneColumnId(columns);
  const statusName = (id) => columns.find((c) => c.id === id)?.name || id;

  const active = sprints.find((s) => s.status === "active");
  const future = sprints.filter((s) => s.status === "future");
  const completed = sprints
    .filter((s) => s.status === "completed")
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  const listFor = (sid) =>
    tasks
      .filter((t) => (t.sprintId || null) === (sid || null))
      .sort((a, b) => (a.backlogOrder ?? 0) - (b.backlogOrder ?? 0));
  const pointsOf = (list) => list.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const doneOf = (list) => list.filter((t) => t.status === doneStatus).length;

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, source, destination } = result;
    const dest = destination.droppableId === "backlog" ? null : destination.droppableId;
    const src = source.droppableId === "backlog" ? null : source.droppableId;
    if (dest === src && source.index === destination.index) return;

    const destTasks = listFor(dest).filter((t) => t._id !== draggableId);
    const orderedIds = [
      ...destTasks.slice(0, destination.index).map((t) => t._id),
      draggableId,
      ...destTasks.slice(destination.index).map((t) => t._id),
    ];
    moveTasks(dest, orderedIds);
  };

  const handleStart = async (sprint) => {
    try {
      await startSprint(sprint._id, {});
    } catch {
      /* toasted */
    }
  };

  const sectionProps = (sprint, droppableId) => {
    const list = listFor(sprint?._id || null);
    return {
      sprint,
      droppableId,
      tasks: list,
      points: pointsOf(list),
      doneCount: doneOf(list),
      statusName,
      onStart: handleStart,
      onComplete: setCompletingSprint,
      onDelete: (s) =>
        window.confirm(`Delete ${s.name}? Its issues move to the backlog.`) && deleteSprint(s._id),
      onQuickAdd: quickAdd,
    };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">Backlog</h1>
          <p className="text-xs text-ink-subtle mt-0.5">
            {project?.name || "Project"} · plan sprints and rank work
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/tasks?projectId=${projectId}`}>
            <Button variant="secondary">
              <LayoutGrid size={15} className="mr-1" /> Board
            </Button>
          </Link>
          <Button onClick={createSprint}>
            <Plus size={16} className="mr-1" /> Create sprint
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-line border-t-brand rounded-full animate-spin" />
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          {active && <SprintSection {...sectionProps(active, active._id)} />}
          {future.map((s) => (
            <SprintSection key={s._id} {...sectionProps(s, s._id)} />
          ))}
          <SprintSection {...sectionProps(null, "backlog")} />
        </DragDropContext>
      )}

      {/* Completed sprints → reports */}
      {completed.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xs font-bold text-ink-subtle uppercase tracking-wide mb-2">
            Completed sprints
          </h2>
          <div className="space-y-1.5">
            {completed.map((s) => (
              <button
                key={s._id}
                onClick={() => setReportSprint(s)}
                className="w-full flex items-center gap-2 bg-white border border-line rounded px-4 py-2.5 hover:bg-canvas transition-colors text-left"
              >
                <FileBarChart size={15} className="text-ink-subtle" />
                <span className="text-sm font-medium text-ink flex-1">{s.name}</span>
                {s.report && (
                  <span className="text-xs text-ink-subtle">
                    {s.report.completed.count}/{s.report.committed.count + s.report.added.count} done ·{" "}
                    {s.report.completionRate}%
                  </span>
                )}
                <span className="text-xs text-brand font-medium">View report</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <CompleteSprintModal
        isOpen={Boolean(completingSprint)}
        onClose={() => setCompletingSprint(null)}
        sprint={completingSprint}
        futureSprints={future}
        totalCount={completingSprint ? listFor(completingSprint._id).length : 0}
        doneCount={completingSprint ? doneOf(listFor(completingSprint._id)) : 0}
        onComplete={async (id, data) => {
          const done = await completeSprint(id, data);
          if (done?.report) setReportSprint(done);
          else toast.success("Sprint completed");
        }}
      />

      <SprintReportModal
        isOpen={Boolean(reportSprint)}
        onClose={() => setReportSprint(null)}
        sprint={reportSprint}
      />
    </div>
  );
};
