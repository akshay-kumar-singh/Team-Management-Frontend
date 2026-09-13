import { useRef, useState } from "react";
import { MarkdownToolbar } from "./MarkdownToolbar";
import { MarkdownContent } from "./MarkdownContent";

/**
 * A small markdown editor: a formatting toolbar, a textarea, and a Write/Preview
 * toggle. Controlled via value/onChange. Used for issue descriptions; comments
 * reuse just the toolbar because they also host the @mention picker.
 */
export const MarkdownEditor = ({
  value,
  onChange,
  placeholder = "Add a description… (markdown supported)",
  rows = 5,
}) => {
  const ref = useRef(null);
  const [tab, setTab] = useState("write");

  return (
    <div>
      <div className="flex items-center justify-between">
        <MarkdownToolbar textareaRef={ref} value={value} onChange={onChange} />
        <div className="flex text-xs">
          {["write", "preview"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-2 py-1 capitalize ${
                tab === t ? "text-brand font-medium" : "text-ink-subtle hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "write" ? (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-white border border-line rounded-b rounded-tr text-sm text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-y font-mono"
        />
      ) : (
        <div className="w-full min-h-[7rem] px-3 py-2 border border-line rounded-b rounded-tr bg-white">
          {value.trim() ? (
            <MarkdownContent content={value} />
          ) : (
            <p className="text-sm text-ink-subtle italic">Nothing to preview.</p>
          )}
        </div>
      )}
    </div>
  );
};
