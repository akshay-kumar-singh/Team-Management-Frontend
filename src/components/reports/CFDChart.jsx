import { niceMax, ticks, sparseIndexes, shortDate, seriesColor } from "./chartUtils";

const W = 640;
const H = 300;
const M = { top: 16, right: 18, bottom: 34, left: 40 };
const plotW = W - M.left - M.right;
const plotH = H - M.top - M.bottom;

/**
 * Cumulative flow diagram: stacked areas of issue counts per board column over
 * time. The band widths show where work piles up (a growing band = a bottleneck).
 * Pure SVG.
 */
export const CFDChart = ({ columns = [], series = [] }) => {
  if (series.length === 0 || columns.length === 0) {
    return (
      <div className="text-center py-12 text-ink-subtle text-sm">
        No flow data yet — issues will chart here as they move across the board.
      </div>
    );
  }

  const totals = series.map((d) => columns.reduce((sum, c) => sum + (d[c.id] || 0), 0));
  const max = niceMax(Math.max(...totals, 1));
  const n = series.length;
  const x = (i) => (n === 1 ? M.left + plotW / 2 : M.left + (i / (n - 1)) * plotW);
  const y = (v) => M.top + plotH - (v / max) * plotH;

  // Bottom→top cumulative boundaries per day, so each column is a filled band
  const areas = columns.map((col, ci) => {
    const top = series.map((d) => {
      let base = 0;
      for (let k = 0; k <= ci; k++) base += d[columns[k].id] || 0;
      return base;
    });
    const bottom = series.map((d) => {
      let base = 0;
      for (let k = 0; k < ci; k++) base += d[columns[k].id] || 0;
      return base;
    });
    const fwd = top.map((v, i) => `${x(i)},${y(v)}`);
    const back = bottom.map((v, i) => `${x(i)},${y(v)}`).reverse();
    return { id: col.id, name: col.name, path: [...fwd, ...back].join(" "), color: seriesColor(ci) };
  });

  const labelIdx = sparseIndexes(n);

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

        {areas.map((a) => (
          <polygon key={a.id} points={a.path} fill={a.color} fillOpacity="0.85" stroke={a.color} strokeWidth="0.5">
            <title>{a.name}</title>
          </polygon>
        ))}

        {labelIdx.map((i) => (
          <text key={i} x={x(i)} y={H - 12} textAnchor="middle" fontSize="10" fill="#6B778C">
            {shortDate(series[i].date)}
          </text>
        ))}
      </svg>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 pl-2 text-xs text-ink-subtle">
        {areas.map((a) => (
          <span key={a.id} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: a.color }} /> {a.name}
          </span>
        ))}
      </div>
    </div>
  );
};
