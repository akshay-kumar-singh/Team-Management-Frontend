import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Folder, Clock } from "lucide-react";
import api from "../../services/api";
import { TypeIcon, Avatar } from "../common/TaskIcons";
import { getRecent, pushRecent } from "../../utils/recentItems";

const Section = ({ title, children }) => (
  <div className="py-1">
    <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-ink-subtle">{title}</p>
    {children}
  </div>
);

const Row = ({ icon, label, sub, onClick }) => (
  <button
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-canvas text-left"
  >
    <span className="flex-shrink-0">{icon}</span>
    <span className="text-sm text-ink truncate flex-1">{label}</span>
    {sub && <span className="text-[11px] text-ink-subtle flex-shrink-0">{sub}</span>}
  </button>
);

export const GlobalSearch = () => {
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);
  const [recent, setRecent] = useState([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const boxRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const focus = () => {
      inputRef.current?.focus();
      setRecent(getRecent());
      setOpen(true);
    };
    window.addEventListener("workzen:focus-search", focus);
    return () => window.removeEventListener("workzen:focus-search", focus);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(`/api/search?q=${encodeURIComponent(q.trim())}`);
        setResults(data);
      } catch {
        setResults(null);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const go = (to, recentItem) => {
    if (recentItem) pushRecent(recentItem);
    navigate(to);
    setOpen(false);
    setQ("");
    inputRef.current?.blur();
  };

  const hasResults =
    results && (results.tasks.length || results.projects.length || results.people.length);

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            setRecent(getRecent());
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          placeholder="Search…  /"
          className="w-36 sm:w-64 pl-8 pr-3 py-1.5 bg-canvas border border-line rounded text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white transition-colors"
        />
      </div>

      {open && (
        <div className="absolute right-0 mt-1 w-80 sm:w-96 bg-white border border-line rounded-lg shadow-xl z-30 max-h-[70vh] overflow-y-auto">
          {!q.trim() ? (
            recent.length ? (
              <Section title="Recently viewed">
                {recent.map((r) => (
                  <Row
                    key={r.type + r.id}
                    icon={<Clock size={14} className="text-ink-subtle" />}
                    label={r.label}
                    sub={r.sublabel}
                    onClick={() => go(r.to)}
                  />
                ))}
              </Section>
            ) : (
              <p className="px-3 py-4 text-sm text-ink-subtle text-center">
                Search issues, projects and people
              </p>
            )
          ) : !hasResults ? (
            <p className="px-3 py-4 text-sm text-ink-subtle text-center">No results for “{q}”</p>
          ) : (
            <>
              {results.tasks.length > 0 && (
                <Section title="Issues">
                  {results.tasks.map((t) => (
                    <Row
                      key={t._id}
                      icon={<TypeIcon type={t.type} />}
                      label={`${t.key} · ${t.title}`}
                      onClick={() =>
                        go(`/browse/${t.key}`, {
                          type: "task",
                          id: t._id,
                          label: `${t.key} · ${t.title}`,
                          to: `/browse/${t.key}`,
                        })
                      }
                    />
                  ))}
                </Section>
              )}
              {results.projects.length > 0 && (
                <Section title="Projects">
                  {results.projects.map((p) => (
                    <Row
                      key={p._id}
                      icon={<Folder size={14} className="text-brand" />}
                      label={p.name}
                      sub={p.key}
                      onClick={() =>
                        go(`/tasks?projectId=${p._id}`, {
                          type: "project",
                          id: p._id,
                          label: p.name,
                          sublabel: p.key,
                          to: `/tasks?projectId=${p._id}`,
                        })
                      }
                    />
                  ))}
                </Section>
              )}
              {results.people.length > 0 && (
                <Section title="People">
                  {results.people.map((u) => (
                    <Row
                      key={u._id}
                      icon={<Avatar name={u.name} size="xs" />}
                      label={u.name}
                      sub={u.role}
                      onClick={() => go("/team")}
                    />
                  ))}
                </Section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
