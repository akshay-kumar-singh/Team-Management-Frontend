import { niceMax, ticks } from "./chartUtils";

const W = 640;
const H = 300;
const M = { top: 16, right: 18, bottom: 48, left: 40 };
const plotW = W - M.left - M.right;
const plotH = H - M.top - M.bottom;

/**
 * Velocity: committed vs completed story points per completed sprint (grouped
 * bars), with a dashed average-velocity line. Pure SVG.
 */
export const VelocityChart = ({ series = [], averageVelocity = 0 }) => {
  if (series.length === 0) {
    return (
      <div className="text-center py-12 text-ink-subtle text-sm">
        No completed sprints yet — velocity appears once you complete a sprint.
      </div>
    );
  }

  const max = niceMax(Math.max(...series.flatMap((s) => [s.committedPoints, s.completedPoints]), 1));
  const y = (v) => M.top + plotH - (v / max) * plotH;
  const groupW = plotW / series.length;
  const barW = Math.min(28, (groupW - 12) / 2);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 320 }} role="img">
        {ticks(max).map((t) => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} stroke="#EBECF0" strokeWidth="1" />
            <text x={M.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#6B778C">
              {t}
            </text>
          </g>
        ))}

        {series.map((s, i) => {
          const cx = M.left + groupW * i + groupW / 2;
          return (
            <g key={s.sprintId || i}>
              <rect
                x={cx - barW - 2}
                y={y(s.committedPoints)}
                width={barW}
                height={M.top + plotH - y(s.committedPoints)}
                fill="#B3D4FF"
                rx="2"
              >
                <title>{`${s.name}: ${s.committedPoints} committed`}</title>
              </rect>
              <rect
                x={cx + 2}
                y={y(s.completedPoints)}
                width={barW}
                height={M.top + plotH - y(s.completedPoints)}
                fill="#0052CC"
                rx="2"
              >
                <title>{`${s.name}: ${s.completedPoints} completed`}</title>
              </rect>
              <text
                x={cx}
                y={H - 28}
                textAnchor="middle"
                fontSize="10"
                fill="#6B778C"
              >
                {s.name.length > 12 ? s.name.slice(0, 11) + "…" : s.name}
              </text>
            </g>
          );
        })}

        {/* Average velocity line */}
        {averageVelocity > 0 && (
          <g>
            <line
              x1={M.left}
              x2={W - M.right}
              y1={y(averageVelocity)}
              y2={y(averageVelocity)}
              stroke="#00875A"
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
            <text x={W - M.right} y={y(averageVelocity) - 5} textAnchor="end" fontSize="10" fill="#00875A">
              avg {averageVelocity}
            </text>
          </g>
        )}
      </svg>

      <div className="flex items-center gap-4 mt-2 pl-2 text-xs text-ink-subtle">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#B3D4FF" }} /> Committed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#0052CC" }} /> Completed
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="18" height="8">
            <line x1="0" y1="4" x2="18" y2="4" stroke="#00875A" strokeWidth="2" strokeDasharray="4 3" />
          </svg>
          Average
        </span>
      </div>
    </div>
  );
};
