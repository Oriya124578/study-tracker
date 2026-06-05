// Phase 6d smoke test for recurrence helpers. Run: `node recurrence.smoke.mjs`
import { recurrenceMatches, recurringInstancesForDate } from './src/lib/recurrence.js';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name); }
};

const d = (s) => {
  const [y, m, day] = s.split('-').map(Number);
  return new Date(y, m - 1, day);
};

console.log('-- daily --');
const daily = { freq: 'daily', interval: 1, startDate: '2026-01-01', active: true };
ok('daily fires on start',        recurrenceMatches(daily, d('2026-01-01')) === true);
ok('daily fires next day',        recurrenceMatches(daily, d('2026-01-02')) === true);
ok('daily rejects before start',  recurrenceMatches(daily, d('2025-12-31')) === false);
const daily3 = { ...daily, interval: 3 };
ok('every 3 days hits day 3',     recurrenceMatches(daily3, d('2026-01-04')) === true);
ok('every 3 days skips day 2',    recurrenceMatches(daily3, d('2026-01-03')) === false);

console.log('-- weekly --');
// 2026-01-04 is a Sunday. byWeekday=[1] (Monday)
const weekly = { freq: 'weekly', interval: 1, byWeekday: [1], startDate: '2026-01-04', active: true };
ok('weekly hits Monday',          recurrenceMatches(weekly, d('2026-01-05')) === true);
ok('weekly skips Tuesday',        recurrenceMatches(weekly, d('2026-01-06')) === false);
ok('weekly hits next Monday',     recurrenceMatches(weekly, d('2026-01-12')) === true);

console.log('-- monthly --');
const monthly = { freq: 'monthly', interval: 1, startDate: '2026-01-15', active: true };
ok('monthly hits 15th',           recurrenceMatches(monthly, d('2026-02-15')) === true);
ok('monthly skips 14th',          recurrenceMatches(monthly, d('2026-02-14')) === false);

console.log('-- skips/endDate/active --');
ok('skip wins',                   recurrenceMatches({ ...daily, skips: { '2026-01-02': true } }, d('2026-01-02')) === false);
ok('endDate excludes after',      recurrenceMatches({ ...daily, endDate: '2026-01-03' }, d('2026-01-04')) === false);
ok('inactive never fires',        recurrenceMatches({ ...daily, active: false }, d('2026-01-01')) === false);

console.log('-- instances for date --');
const rules = [
  { id: 'r1', title: 'Meds', time: '08:00', durationMinutes: 15, ...daily },
  { id: 'r2', title: 'Run',  time: null,    durationMinutes: 30, ...daily }, // skipped: no time
  { id: 'r3', title: 'Done', time: '09:00', durationMinutes: 15, completions: { '2026-01-02': { done: true } }, ...daily },
];
const insts = recurringInstancesForDate(rules, '2026-01-02');
ok('only timed, uncompleted rules produce instances', insts.length === 1);
ok('instance is locked',          insts[0].isLocked === true);
ok('instance source is recurring',insts[0].source === 'recurring');
ok('instance id is deterministic',insts[0].id === 'recur-r1-2026-01-02');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
