// Tiny helpers shared by the hand-rolled SVG charts. No charting library —
// these render as plain <svg> so there's zero runtime dependency and the charts
// inherit the app's theme tokens directly.

// Round an axis maximum up to a friendly value (5, 10, 20, 50, 100, ...).
export const niceMax = (max) => {
  if (!max || max <= 5) return 5;
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const n = max / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
};

// Evenly spaced tick values from 0 to max (inclusive).
export const ticks = (max, count = 4) =>
  Array.from({ length: count + 1 }, (_, i) => Math.round((max / count) * i));

// Show at most ~7 x-axis labels so a long series doesn't overlap.
export const sparseIndexes = (length, max = 7) => {
  if (length <= max) return Array.from({ length }, (_, i) => i);
  const step = Math.ceil(length / max);
  const out = [];
  for (let i = 0; i < length; i += step) out.push(i);
  if (out[out.length - 1] !== length - 1) out.push(length - 1);
  return out;
};

// "2026-08-22" → "Aug 22"
export const shortDate = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Palette for stacked series (columns). Left→right roughly mirrors a board's
// to-do → done flow: neutral → blue → green.
export const SERIES_COLORS = [
  "#8993A4", // grey (to do)
  "#0052CC", // brand blue (in progress)
  "#5243AA", // purple (review)
  "#00875A", // green (done)
  "#DE350B", // red (extra column)
  "#FF8B00", // orange (extra column)
  "#00A3BF", // teal (extra column)
];

export const seriesColor = (i) => SERIES_COLORS[i % SERIES_COLORS.length];
