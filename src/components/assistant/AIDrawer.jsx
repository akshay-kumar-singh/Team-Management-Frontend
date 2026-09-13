import { useEffect, useRef, useState } from "react";
import { X, MessageSquare, Bot, Sparkles } from "lucide-react";
import { TaskAssistant } from "./TaskAssistant";
import { AgentActivityPanel } from "../agent/AgentActivityPanel";

const MIN_WIDTH = 360;
const STORAGE_KEY = "workzen:aiDrawerWidth";

/**
 * Right-side slide-over that houses the two AI features (chat assistant +
 * background agent activity) behind tabs, so the board page itself stays clean.
 * The panel is resizable — drag its left edge to make it wider/narrower — and
 * its body scrolls vertically. Both panels stay mounted while open so the
 * conversation and job list keep their state when you switch tabs.
 */
export const AIDrawer = ({ isOpen, onClose, tasks, onTaskAction, projectId, onImported }) => {
  const [tab, setTab] = useState("agent");
  const [width, setWidth] = useState(() => {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    return saved && saved >= MIN_WIDTH ? saved : 460;
  });
  const widthRef = useRef(width);
  const resizingRef = useRef(false);

  const setW = (w) => {
    widthRef.current = w;
    setWidth(w);
  };

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && !resizingRef.current && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Drag-to-resize (the drawer is right-anchored, so width = viewport − pointerX)
  useEffect(() => {
    const onMove = (e) => {
      if (!resizingRef.current) return;
      const w = window.innerWidth - e.clientX;
      setW(Math.max(MIN_WIDTH, Math.min(w, window.innerWidth - 24)));
    };
    const onUp = () => {
      if (!resizingRef.current) return;
      resizingRef.current = false;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      try {
        localStorage.setItem(STORAGE_KEY, String(widthRef.current));
      } catch {
        /* private mode — width just won't persist */
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const startResize = (e) => {
    e.preventDefault();
    resizingRef.current = true;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "ew-resize";
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="AI tools"
        style={{ width: `min(${width}px, 100vw)` }}
        className={`absolute right-0 top-0 h-full bg-canvas shadow-2xl flex flex-col transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Resize handle (left edge) */}
        <div
          onPointerDown={startResize}
          title="Drag to resize"
          className="group/resize absolute left-0 top-0 h-full w-2 -translate-x-1/2 cursor-ew-resize z-20"
        >
          <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-line/0 group-hover/resize:bg-brand/50 transition-colors" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-white">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-brand" />
            <h2 className="text-sm font-semibold text-ink">AI Tools</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 text-ink-subtle hover:text-ink"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-line bg-white">
          {[
            { id: "agent", label: "Agent Activity", icon: Bot },
            { id: "assistant", label: "Assistant", icon: MessageSquare },
          ].map(({ id, label, icon }) => {
            const Icon = icon;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  tab === id
                    ? "border-brand text-brand"
                    : "border-transparent text-ink-subtle hover:text-ink"
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            );
          })}
        </div>

        {/* Body — both stay mounted; hide the inactive one to preserve state.
            min-h-0 is required for the flex child to actually scroll. */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          <div className={tab === "assistant" ? "" : "hidden"}>
            <TaskAssistant
              onTaskAction={onTaskAction}
              tasks={tasks}
              projectId={projectId}
              onImported={onImported}
            />
          </div>
          <div className={tab === "agent" ? "" : "hidden"}>
            <AgentActivityPanel />
          </div>
        </div>
      </div>
    </div>
  );
};
