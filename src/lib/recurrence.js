// Phase 6d: Pure helpers for recurring task rules.
//
// A recurring task rule lives in users/{uid}/cl_recurringTasks/{id} with shape:
//   {
//     title, notes, priority, color,
//     freq: 'daily'|'weekly'|'monthly', interval: number,
//     byWeekday: number[]|null,    // weekly: [0..6], 0=Sunday
//     byMonthday: number[]|null,   // monthly: [1..31]
//     startDate: 'yyyy-MM-dd', endDate: 'yyyy-MM-dd'|null,
//     time: 'HH:MM'|null, durationMinutes: number,
//     completions: { 'yyyy-MM-dd': { done, doneAt } },
//     skips: { 'yyyy-MM-dd': true },
//     active: boolean
//   }
//
// These helpers are intentionally tiny and pure so they can be unit-tested
// without firebase / dom dependencies.

// Parse a 'yyyy-MM-dd' string into a local-midnight Date. We avoid `new Date(str)`
// because that interprets bare ISO dates as UTC and shifts day boundaries.
const parseLocalDate = (s) => {
  if (!s || typeof s !== 'string') return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Whole-day difference (ignores DST hour drift).
const daysBetween = (a, b) => {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / 86400000);
};

const monthsBetween = (a, b) => {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
};

/**
 * Does this recurring rule fire on the given JS Date?
 * Pure — no side effects.
 */
export const recurrenceMatches = (rule, date) => {
  if (!rule || !date) return false;
  if (rule.active === false) return false;

  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const start = parseLocalDate(rule.startDate);
  if (!start) return false;
  if (target < start) return false;

  if (rule.endDate) {
    const end = parseLocalDate(rule.endDate);
    if (end && target > end) return false;
  }

  const key = toDateKey(target);
  if (rule.skips && rule.skips[key]) return false;

  const interval = Math.max(1, Number(rule.interval) || 1);
  const freq = rule.freq || 'daily';

  if (freq === 'daily') {
    const diff = daysBetween(start, target);
    return diff >= 0 && diff % interval === 0;
  }

  if (freq === 'weekly') {
    const weekday = target.getDay(); // 0=Sunday
    if (Array.isArray(rule.byWeekday) && rule.byWeekday.length > 0) {
      if (!rule.byWeekday.includes(weekday)) return false;
    } else {
      // Default to the start date's weekday if none specified.
      if (weekday !== start.getDay()) return false;
    }
    // Interval applies in weeks, measured from the start week.
    const startWeek = new Date(start);
    startWeek.setDate(start.getDate() - start.getDay()); // back to Sunday of start week
    const targetWeek = new Date(target);
    targetWeek.setDate(target.getDate() - target.getDay());
    const weekDiff = Math.round(daysBetween(startWeek, targetWeek) / 7);
    return weekDiff >= 0 && weekDiff % interval === 0;
  }

  if (freq === 'monthly') {
    const day = target.getDate();
    if (Array.isArray(rule.byMonthday) && rule.byMonthday.length > 0) {
      if (!rule.byMonthday.includes(day)) return false;
    } else {
      if (day !== start.getDate()) return false;
    }
    const monthDiff = monthsBetween(start, target);
    return monthDiff >= 0 && monthDiff % interval === 0;
  }

  return false;
};

/**
 * For a given date string ('yyyy-MM-dd'), return an array of synthetic
 * locked-block objects (one per matching rule) ready to merge into
 * context.fixedEvents for the AI scheduler.
 *
 * Block shape mirrors the Phase 6a canonical Block, with:
 *   id: `recur-{ruleId}-{dateStr}` (synthetic, deterministic)
 *   source: 'recurring', refId: ruleId
 *   isLocked: true
 *
 * Rules without a `time` are skipped (they can't be placed as fixed events).
 * Rules already completed for this date are also skipped.
 */
export const recurringInstancesForDate = (rules, dateStr) => {
  if (!Array.isArray(rules) || !dateStr) return [];
  const date = parseLocalDate(dateStr);
  if (!date) return [];

  const out = [];
  for (const rule of rules) {
    if (!rule || !rule.time) continue;
    if (rule.completions && rule.completions[dateStr]?.done) continue;
    if (!recurrenceMatches(rule, date)) continue;

    const duration = Math.max(1, Number(rule.durationMinutes) || 30);
    const [hh, mm] = rule.time.split(':').map(Number);
    const startMin = hh * 60 + mm;
    const endMin = Math.min(startMin + duration, 24 * 60 - 1);
    const endHH = String(Math.floor(endMin / 60)).padStart(2, '0');
    const endMM = String(endMin % 60).padStart(2, '0');

    out.push({
      id: `recur-${rule.id}-${dateStr}`,
      source: 'recurring',
      refId: rule.id,
      type: 'task',
      title: rule.title || '',
      startTime: rule.time,
      endTime: `${endHH}:${endMM}`,
      duration,
      isLocked: true,
      isCompleted: false,
      status: 'planned',
      isProposed: false,
      notes: rule.notes || '',
    });
  }
  return out;
};
