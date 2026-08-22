import { KanbanBoard } from "../components/tasks/KanbanBoard";
import { TaskAssistant } from "../components/assistant/TaskAssistant";
import { AgentActivityPanel } from "../components/agent/AgentActivityPanel";
import { CompleteSprintModal } from "../components/sprints/CompleteSprintModal";
import { SprintReportModal } from "../components/sprints/SprintReportModal";
import { ViewTabs } from "../components/common/ViewTabs";
import { Button } from "../components/common/Button";
import { useTasks } from "../hooks/useTasks";
import { useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Target } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { columnsOf, doneColumnId } from "../utils/constants";

export const Tasks = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const { tasks, createTask, updateTask, deleteTask, reorderColumn, fetchTasks } =
    useTasks(projectId);
  const [teamMembers, setTeamMembers] = useState([]);
  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [completing, setCompleting] = useState(false);
  const [reportSprint, setReportSprint] = useState(null);

  // Board config (columns / transitions) lives on the project
  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    try {
      const { data } = await api.get("/api/projects");
      setProject(data.find((p) => p._id === projectId) || null);
    } catch {
      /* board falls back to default columns */
    }
  }, [projectId]);

  const fetchSprints = useCallback(async () => {
    if (!projectId) return;
    try {
      const { data } = await api.get(`/api/sprints?projectId=${projectId}`);
      setSprints(data);
    } catch {
      /* no sprints → plain Kanban board */
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
    fetchSprints();
  }, [fetchProject, fetchSprints]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data } = await api.get("/api/users/team");
        setTeamMembers(data);
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      }
    };
    fetchMembers();
  }, []);

  const handleTaskAction = async (command) => {
    try {
      if (command.action === "create") {
        const newTask = await createTask({
          title: command.title,
          description: command.description || "",
          status: "todo",
        });
        return newTask;
      } else if (command.action === "move") {
        const taskToMove =
          tasks.find((t) => t._id === command.taskId) ||
          tasks.find((t) =>
            t.title.toLowerCase().includes(command.taskTitle?.toLowerCase()),
          );

        if (taskToMove) {
          await updateTask(taskToMove._id, {
            status: command.status,
            assignedTo:
              taskToMove.assignedTo?._id || taskToMove.assignedTo || null,
          });
        } else {
          toast.error("Task not found");
        }
      } else if (command.action === "assign") {
        const taskId =
          command.taskId ||
          tasks.find((t) =>
            t.title.toLowerCase().includes(command.taskTitle?.toLowerCase()),
          )?._id;

        if (!taskId) {
          toast.error("Task not found");
          return;
        }

        const userToAssign = teamMembers.find((m) =>
          m.name.toLowerCase().includes(command.user?.toLowerCase()),
        );

        if (!userToAssign) {
          toast.error(`User "${command.user}" not found in team`);
          return;
        }

        await updateTask(taskId, { assignedTo: userToAssign._id });
      } else if (command.action === "delete") {
        const taskToDelete =
          tasks.find((t) => t._id === command.taskId) ||
          tasks.find((t) =>
            t.title.toLowerCase().includes(command.taskTitle?.toLowerCase()),
          );

        if (taskToDelete) {
          await deleteTask(taskToDelete._id);
        } else {
          toast.error("Task not found");
        }
      }
    } catch (error) {
      console.error("Task action error:", error);
      toast.error("Failed to process command");
    }
  };

  const activeSprint = sprints.find((s) => s.status === "active");
  const futureSprints = sprints.filter((s) => s.status === "future");
  const doneStatus = doneColumnId(columnsOf(project));
  const doneCount = tasks.filter((t) => t.status === doneStatus).length;

  return (
    <div className="space-y-6">
      <ViewTabs projectId={projectId} />

      {/* Sprint banner */}
      {projectId && (
        <div
          className={`flex flex-wrap items-center gap-3 rounded-lg border px-4 py-2.5 ${
            activeSprint ? "bg-brand-tint border-brand" : "bg-white border-line"
          }`}
        >
          {activeSprint ? (
            <>
              <span className="text-sm font-semibold text-ink">{activeSprint.name}</span>
              {activeSprint.goal && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-ink-subtle">
                  <Target size={12} /> {activeSprint.goal}
                </span>
              )}
              <span className="text-xs text-ink-subtle">
                {doneCount}/{tasks.length} done
              </span>
              <div className="flex-1" />
              <Button variant="secondary" onClick={() => setCompleting(true)}>
                <CheckCircle2 size={14} className="mr-1" /> Complete sprint
              </Button>
            </>
          ) : (
            <span className="text-sm text-ink-subtle">
              No active sprint — the board shows your backlog.
            </span>
          )}
        </div>
      )}

      {/* Kanban Board - full width */}
      <KanbanBoard
        tasks={tasks}
        project={project}
        createTask={createTask}
        updateTask={updateTask}
        deleteTask={deleteTask}
        reorderColumn={reorderColumn}
        fetchTasks={fetchTasks}
        onProjectUpdated={setProject}
      />

      {/* AI Panels - side by side on large screens, stacked on mobile */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TaskAssistant onTaskAction={handleTaskAction} tasks={tasks} />
        <AgentActivityPanel />
      </div>

      <CompleteSprintModal
        isOpen={completing}
        onClose={() => setCompleting(false)}
        sprint={activeSprint}
        futureSprints={futureSprints}
        totalCount={tasks.length}
        doneCount={doneCount}
        onComplete={async (id, data) => {
          const { data: done } = await api.post(`/api/sprints/${id}/complete`, data);
          await Promise.all([fetchTasks(), fetchSprints()]);
          if (done?.report) setReportSprint(done);
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
