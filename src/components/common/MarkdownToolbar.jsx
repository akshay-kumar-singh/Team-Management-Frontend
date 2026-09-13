import { Bold, Italic, Code, Link2, List, ListChecks, Quote } from "lucide-react";

/**
 * A formatting toolbar that edits the markdown in a textarea in place. It's
 * decoupled from any particular editor — pass the textarea's ref plus its
 * controlled value/onChange and the buttons splice markdown around the
 * selection (or the current line for list/quote actions).
 */
export const MarkdownToolbar = ({ textareaRef, value, onChange }) => {
  const el = () => textareaRef.current;

  const setValue = (next, selStart, selEnd) => {
    onChange(next);
    // Restore the caret after React re-renders the controlled value
    requestAnimationFrame(() => {
      const node = el();
      if (node) {
        node.focus();
        node.setSelectionRange(selStart, selEnd);
      }
    });
  };

  const wrap = (before, after = before, placeholder = "text") => {
    const node = el();
    if (!node) return;
    const start = node.selectionStart;
    const end = node.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    setValue(next, start + before.length, start + before.length + selected.length);
  };

  const prefixLine = (prefix) => {
    const node = el();
    if (!node) return;
    const start = node.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    setValue(next, start + prefix.length, start + prefix.length);
  };

  const btn =
    "p-1.5 rounded text-ink-subtle hover:bg-gray-100 hover:text-ink transition-colors";

  return (
    <div className="flex items-center gap-0.5 border border-line border-b-0 rounded-t bg-canvas px-1 py-0.5">
      <button type="button" title="Bold" className={btn} onClick={() => wrap("**")}>
        <Bold size={14} />
      </button>
      <button type="button" title="Italic" className={btn} onClick={() => wrap("*")}>
        <Italic size={14} />
      </button>
      <button type="button" title="Inline code" className={btn} onClick={() => wrap("`")}>
        <Code size={14} />
      </button>
      <button
        type="button"
        title="Code block"
        className={btn}
        onClick={() => wrap("\n```\n", "\n```\n", "code")}
      >
        <span className="text-[11px] font-mono font-bold">{"{ }"}</span>
      </button>
      <span className="w-px h-4 bg-line mx-0.5" />
      <button type="button" title="Bulleted list" className={btn} onClick={() => prefixLine("- ")}>
        <List size={14} />
      </button>
      <button type="button" title="Checklist" className={btn} onClick={() => prefixLine("- [ ] ")}>
        <ListChecks size={14} />
      </button>
      <button type="button" title="Quote" className={btn} onClick={() => prefixLine("> ")}>
        <Quote size={14} />
      </button>
      <button type="button" title="Link" className={btn} onClick={() => wrap("[", "](url)", "text")}>
        <Link2 size={14} />
      </button>
    </div>
  );
};
