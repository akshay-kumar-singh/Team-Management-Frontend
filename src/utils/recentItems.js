// Lightweight "recently viewed" list, kept per-browser in localStorage.
const KEY = "workzen:recent";
const MAX = 8;

export const getRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};

/** item: { type: "task" | "project", id, label, sublabel?, to } */
export const pushRecent = (item) => {
  try {
    const list = getRecent().filter((x) => !(x.type === item.type && x.id === item.id));
    list.unshift({ ...item, at: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* storage unavailable — recents are a nicety, never critical */
  }
};
