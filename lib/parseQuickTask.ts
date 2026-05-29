// Smart-input parser for the quick-add task sheet. Pulls a due date, time,
// #tag and 🔥 priority out of free Russian text and returns the cleaned title.
export type ParsedQuickTask = {
  cleanTitle: string;
  due?: string; // YYYY-MM-DD (local)
  time?: string; // HH:MM
  tag?: string;
  priority?: 'high';
};

const pad = (n: number) => String(n).padStart(2, '0');
const localDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function parseQuickTask(text: string): ParsedQuickTask {
  let t = ` ${text} `;
  const out: ParsedQuickTask = { cleanTitle: '' };
  const now = new Date();

  // Priority
  if (/🔥|\bсроч/iu.test(t)) {
    out.priority = 'high';
    t = t.replace(/🔥|\bсроч\w*/giu, ' ');
  }

  // Date (check the longer phrases first)
  if (/\bпослезавтра\b/iu.test(t)) {
    const d = new Date(now); d.setDate(d.getDate() + 2); out.due = localDate(d);
    t = t.replace(/\bпослезавтра\b/giu, ' ');
  } else if (/(на неделе|через неделю)/iu.test(t)) {
    const d = new Date(now); d.setDate(d.getDate() + 7); out.due = localDate(d);
    t = t.replace(/(на неделе|через неделю)/giu, ' ');
  } else if (/\bсегодня\b/iu.test(t)) {
    out.due = localDate(now);
    t = t.replace(/\bсегодня\b/giu, ' ');
  } else if (/\bзавтра\b/iu.test(t)) {
    const d = new Date(now); d.setDate(d.getDate() + 1); out.due = localDate(d);
    t = t.replace(/\bзавтра\b/giu, ' ');
  }

  // Time: "в 18:00", "в 18", or a bare "18:00"
  const time = t.match(/\bв\s?(\d{1,2})(?::(\d{2}))?\b/iu) ?? t.match(/\b(\d{1,2}):(\d{2})\b/);
  if (time) {
    const hh = Math.min(23, parseInt(time[1], 10));
    const mm = time[2] ? Math.min(59, parseInt(time[2], 10)) : 0;
    out.time = `${pad(hh)}:${pad(mm)}`;
    t = t.replace(time[0], ' ');
  }

  // Tag (#работа — Cyrillic-aware)
  const tag = t.match(/#([\p{L}\d_]+)/u);
  if (tag) {
    out.tag = tag[1];
    t = t.replace(tag[0], ' ');
  }

  out.cleanTitle = t.trim().replace(/\s+/g, ' ');
  return out;
}
