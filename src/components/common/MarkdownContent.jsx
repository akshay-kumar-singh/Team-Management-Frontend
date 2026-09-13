import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Safe markdown renderer for descriptions and comments. react-markdown does NOT
 * render raw HTML (no rehype-raw), so user content can't inject <script>; links
 * are sanitized by the library's default url transform. We override elements to
 * match the app's typography and extract only the props we use (never spreading
 * react-markdown's internal `node` onto the DOM).
 */
const components = {
  p: ({ children }) => (
    <p className="text-sm text-ink leading-relaxed my-2 first:mt-0 last:mb-0">{children}</p>
  ),
  a: ({ children, href }) => (
    <a
      className="text-brand hover:underline break-words"
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-0.5 text-sm text-ink">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-0.5 text-sm text-ink">{children}</ol>,
  li: ({ children, className }) => (
    <li className={className?.includes("task-list-item") ? "list-none -ml-4" : ""}>{children}</li>
  ),
  input: ({ checked, type }) =>
    type === "checkbox" ? (
      <input type="checkbox" checked={!!checked} readOnly className="mr-1.5 align-middle" />
    ) : null,
  code: ({ className, children }) => {
    // react-markdown v10 dropped the `inline` prop — infer block code from a
    // language class or a newline; everything else is inline.
    const isBlock = /language-/.test(className || "") || String(children ?? "").includes("\n");
    return isBlock ? (
      <code className={`font-mono text-[13px] ${className || ""}`}>{children}</code>
    ) : (
      <code className="bg-gray-100 text-[13px] text-danger px-1 py-0.5 rounded font-mono">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-gray-900 text-gray-100 rounded-md p-3 my-2 overflow-x-auto text-[13px] leading-relaxed">
      {children}
    </pre>
  ),
  h1: ({ children }) => <h1 className="text-lg font-semibold text-ink mt-3 mb-1.5">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-semibold text-ink mt-3 mb-1.5">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold text-ink mt-2 mb-1">{children}</h3>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-line pl-3 my-2 text-ink-subtle italic">{children}</blockquote>
  ),
  hr: () => <hr className="my-3 border-line" />,
  img: ({ src, alt }) => (
    <a href={src} target="_blank" rel="noopener noreferrer">
      <img src={src} alt={alt || ""} className="max-w-full max-h-80 rounded border border-line my-2" />
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-line px-2 py-1 bg-canvas text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => <td className="border border-line px-2 py-1">{children}</td>,
};

export const MarkdownContent = ({ content = "" }) => (
  <div className="markdown-body">
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  </div>
);
