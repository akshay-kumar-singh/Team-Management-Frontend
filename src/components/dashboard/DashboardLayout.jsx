import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

export const DashboardLayout = () => {
  // Sidebar collapse works on every screen size (Jira-style). The choice is
  // remembered on desktop; on phones it starts collapsed and shows as an overlay.
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return false;
    try {
      const s = localStorage.getItem("workzen:sidebarOpen");
      return s === null ? true : s === "true";
    } catch {
      return true;
    }
  });
  const location = useLocation();
  const { userData } = useAuth();
  const suspended = userData?.teamId?.status === "suspended";

  // Explicit toggle (hamburger) — remembers the desktop preference
  const toggleSidebar = () =>
    setSidebarOpen((v) => {
      const next = !v;
      try {
        localStorage.setItem("workzen:sidebarOpen", String(next));
      } catch {
        /* private mode — preference just won't persist */
      }
      return next;
    });

  // On phones, close the overlay after navigating (don't touch desktop preference)
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [location.pathname]);

  // Global keyboard shortcuts: "/" focuses search, "c" opens the create dialog.
  // Ignored while typing in a field.
  useEffect(() => {
    const onKey = (e) => {
      const el = e.target;
      const typing =
        el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.tagName === "SELECT" ||
        el.isContentEditable;
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "/") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("workzen:focus-search"));
      } else if (e.key === "c") {
        window.dispatchEvent(new CustomEvent("workzen:create"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — slides fully out of view (both mobile and desktop) when collapsed */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      {/* Main content area — reflows to fill the space when the sidebar is collapsed */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-300 ${
          sidebarOpen ? "lg:ml-64" : "ml-0"
        }`}
      >
        <Header onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />
        {suspended && (
          <div className="bg-warn-tint border-b border-line text-warn text-sm font-medium px-4 py-2 text-center">
            This workspace is suspended — everything is read-only. Contact
            support to restore access.
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
