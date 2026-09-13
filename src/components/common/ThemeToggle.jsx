import { useState } from "react";
import { Sun, Moon } from "lucide-react";

const KEY = "workzen:theme";

const isDark = () => document.documentElement.getAttribute("data-theme") === "dark";

/** Light/dark theme toggle. Persists the choice and flips the root attribute. */
export const ThemeToggle = () => {
  const [dark, setDark] = useState(isDark);

  const toggle = () => {
    const next = !dark;
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {
      /* ignore private-mode storage errors */
    }
    setDark(next);
  };

  return (
    <button
      onClick={toggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
      className="p-2 text-ink-subtle hover:bg-gray-100 rounded transition-colors"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
};
