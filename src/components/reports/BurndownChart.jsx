import { niceMax, ticks, sparseIndexes, shortDate } from "./chartUtils";

const W = 640;
const H = 280;
const M = { top: 16, right: 18, bottom: 34, left: 40 };
const plotW = W - M.left - M.right;
const plotH = H - M.top - M.bottom;

/**
 * Sprint commitment burndown: remaining story points per day (brand line)
 * against the ideal straight line (dashed). Pure SVG, no chart library.
 */
export const BurndownChart = ({ points = [], committedPoints = 0 }) => {
  if (points.length === 0) {
    return <Empty label="No burndown data — start a sprint to begin tracking." />;
  }

  const max = niceMax(Math.max(committedPoints, ...points.map((p) => p.remaining), 1));
  const n = points.length;
  const x = (i) => (n === 1 ? M.left + plotW / 2 : M.left + (i / (n - 1)) * plotW);
  const y = (v) => M.top + plotH - (v / max) * plotH;

  const line = (key) => points.map((p, i) => `${x(i)},${y(p[key])}`).join(" ");
  const labelIdx = sparseIndexes(n);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 320 }} role="img">
        {/* Y grid + ticks */}
        {ticks(max).map((t) => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} stroke="#EBECF0" strokeWidth="1" />
            <text x={M.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#6B778C">
              {t}
            </text>
          </g>
        ))}

        {/* Ideal line */}
        <polyline
          points={line("ideal")}
          fill="none"
          stroke="#8993A4"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        {/* Actual remaining line */}
        <polyline points={line("remaining")} fill="none" stroke="#0052CC" strokeWidth="2.5" />
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.remaining)} r="3" fill="#0052CC">
            <title>{`${shortDate(p.date)} — ${p.remaining} pts remaining`}</title>
          </circle>
        ))}

        {/* X labels */}
        {labelIdx.map((i) => (
          <text key={i} x={x(i)} y={H - 12} textAnchor="middle" fontSize="10" fill="#6B778C">
            {shortDate(points[i].date)}
          </text>
        ))}
      </svg>

      <Legend
        items={[
          { color: "#0052CC", label: "Remaining", dash: false },
          { color: "#8993A4", label: "Ideal", dash: true },
        ]}
      />
    </div>
  );
};

const Legend = ({ items }) => (
  <div className="flex items-center gap-4 mt-2 pl-2">
    {items.map((it) => (
      <span key={it.label} className="flex items-center gap-1.5 text-xs text-ink-subtle">
        <svg width="18" height="8">
          <line
            x1="0"
            y1="4"
            x2="18"
            y2="4"
            stroke={it.color}
            strokeWidth="2.5"
            strokeDasharray={it.dash ? "4 3" : "0"}
          />
        </svg>
        {it.label}
      </span>
    ))}
  </div>
);

const Empty = ({ label }) => (
  <div className="text-center py-12 text-ink-subtle text-sm">{label}</div>
);
