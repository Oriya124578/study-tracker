// Smoke tests for scheduleEngine. Run with: node src/lib/scheduleEngine.smoke.mjs
// Pure functions only — no Firebase / no React.

import {
  timeToMin,
  minToTime,
  accordion,
  validateAndRepair,
  nextLegalStart,
  chooseEngine,
  NO_FIT,
} from './scheduleEngine.js';

let passed = 0;
let failed = 0;
const fails = [];

const assert = (name, cond, detail) => {
  if (cond) { passed++; return; }
  failed++;
  fails.push({ name, detail });
};

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------- time helpers ----------
assert('timeToMin 00:00', timeToMin('00:00') === 0);
assert('timeToMin 23:59', timeToMin('23:59') === 1439);
assert('minToTime roundtrip', minToTime(timeToMin('07:30')) === '07:30');
let threw = false; try { timeToMin('24:00'); } catch { threw = true; }
assert('timeToMin rejects 24:00', threw);
threw = false; try { timeToMin('7:5'); } catch { threw = true; }
assert('timeToMin rejects 7:5', threw);

// ---------- nextLegalStart ----------
const bounds = { wakeMin: 420 /*07:00*/, sleepMin: 1380 /*23:00*/ };
assert(
  'nextLegalStart trivial',
  nextLegalStart(420, 60, [], bounds) === 420
);
assert(
  'nextLegalStart jumps anchor',
  nextLegalStart(420, 60, [{ start: 420, end: 540 }], bounds) === 540
);
assert(
  'nextLegalStart no_fit when past sleep',
  nextLegalStart(1350, 60, [], bounds) === NO_FIT
);
assert(
  'nextLegalStart respects shabbat window',
  nextLegalStart(420, 60, [], { wakeMin: 0, sleepMin: 1440, shabbat: { blockStartMin: 420, blockEndMin: null } }) === NO_FIT
);

// ---------- accordion: FINISH_EARLY pulls subsequent blocks up ----------
{
  const blocks = [
    { id: 'a', source: 'task', refId: 't1', type: 'study', title: 'A',
      startTime: '09:00', endTime: '10:30', duration: 90, isLocked: false },
    { id: 'b', source: 'task', refId: 't2', type: 'study', title: 'B',
      startTime: '11:00', endTime: '12:00', duration: 60, isLocked: false },
  ];
  const r = accordion(blocks, { kind: 'FINISH_EARLY', blockId: 'a', newEndTime: '10:00' }, bounds);
  // delta = -30. b should move from 11:00 -> 10:30 (pulled up by 30 min, clamped to cursor 10:00).
  // Actually delta=-30, desired = max(cursor=10:00=600, origStart=11:00=660 + (-30) = 630) = 630 = 10:30
  const bMoved = r.blocks.find((x) => x.id === 'b');
  assert('FINISH_EARLY pulls B up to 10:30', bMoved?.startTime === '10:30', bMoved);
  assert('FINISH_EARLY no tray', r.tray.length === 0);
}

// ---------- accordion: FINISH_LATE ripples down ----------
{
  const blocks = [
    { id: 'a', source: 'task', refId: 't1', type: 'study', title: 'A',
      startTime: '09:00', endTime: '10:00', duration: 60, isLocked: false },
    { id: 'b', source: 'task', refId: 't2', type: 'study', title: 'B',
      startTime: '10:00', endTime: '11:00', duration: 60, isLocked: false },
  ];
  const r = accordion(blocks, { kind: 'FINISH_LATE', blockId: 'a', newEndTime: '10:30' }, bounds);
  const bMoved = r.blocks.find((x) => x.id === 'b');
  assert('FINISH_LATE pushes B to 10:30', bMoved?.startTime === '10:30', bMoved);
}

// ---------- accordion: locked anchor is jumped, never moved ----------
{
  const blocks = [
    { id: 'a', source: 'task', type: 'study', title: 'A',
      startTime: '09:00', endTime: '10:00', duration: 60, isLocked: false },
    { id: 'lock', source: 'event', refId: 'e1', type: 'event', title: 'Lecture',
      startTime: '11:00', endTime: '12:00', duration: 60, isLocked: true },
    { id: 'b', source: 'task', type: 'study', title: 'B',
      startTime: '10:00', endTime: '10:30', duration: 30, isLocked: false },
  ];
  // FINISH_LATE: a now ends at 11:30, but lock occupies 11:00-12:00
  const r = accordion(blocks, { kind: 'FINISH_LATE', blockId: 'a', newEndTime: '11:30' }, bounds);
  const lock = r.blocks.find((x) => x.id === 'lock');
  assert('locked anchor unchanged', lock?.startTime === '11:00' && lock?.endTime === '12:00');
  const bMoved = r.blocks.find((x) => x.id === 'b');
  // b must jump past lock to >= 12:00
  assert('B jumped past lock', bMoved && timeToMin(bMoved.startTime) >= 720, bMoved);
}

// ---------- accordion: overflow -> tray ----------
{
  const blocks = [
    { id: 'a', source: 'task', type: 'study', title: 'A',
      startTime: '22:00', endTime: '22:30', duration: 30, isLocked: false },
    { id: 'b', source: 'task', type: 'study', title: 'B',
      startTime: '22:30', endTime: '23:00', duration: 30, isLocked: false },
  ];
  const r = accordion(blocks, { kind: 'FINISH_LATE', blockId: 'a', newEndTime: '23:00' }, bounds);
  assert('overflow tray populated', r.tray.length === 1 && r.tray[0].id === 'b', r);
  assert('overflow diagnostics flag', r.diagnostics.overflow === true);
}

// ---------- accordion: REMOVE leaves gap, follower pulls up ----------
{
  const blocks = [
    { id: 'gone', source: 'task', type: 'study', title: 'Gone',
      startTime: '09:00', endTime: '10:00', duration: 60, isLocked: false },
    { id: 'b', source: 'task', type: 'study', title: 'B',
      startTime: '11:00', endTime: '12:00', duration: 60, isLocked: false },
  ];
  const r = accordion(blocks, { kind: 'REMOVE', blockId: 'gone' }, bounds);
  const bMoved = r.blocks.find((x) => x.id === 'b');
  assert('REMOVE pulls follower up', bMoved?.startTime === '10:00', bMoved);
  assert('REMOVE drops the block', !r.blocks.find((x) => x.id === 'gone'));
}

// ---------- accordion: refuses to move a locked block ----------
{
  const blocks = [
    { id: 'lock', source: 'event', type: 'event', title: 'L',
      startTime: '10:00', endTime: '11:00', duration: 60, isLocked: true },
  ];
  const r = accordion(blocks, { kind: 'FINISH_LATE', blockId: 'lock', newEndTime: '12:00' }, bounds);
  assert('locked block not mutated', r.blocks[0].endTime === '11:00');
  assert('lock-mutation diagnostic', r.diagnostics.notes.includes('tried_to_move_lock'));
}

// ---------- accordion: purity ----------
{
  const blocks = [
    { id: 'a', source: 'task', type: 'study', title: 'A',
      startTime: '09:00', endTime: '10:00', duration: 60, isLocked: false },
  ];
  const snapshot = JSON.stringify(blocks);
  accordion(blocks, { kind: 'FINISH_EARLY', blockId: 'a', newEndTime: '09:30' }, bounds);
  assert('input not mutated', JSON.stringify(blocks) === snapshot);
}

// ---------- validateAndRepair ----------

// drops leisure
{
  const r = validateAndRepair(
    [
      { id: 'l', type: 'leisure', title: 'break', startTime: '10:00', endTime: '10:30' },
      { id: 's', type: 'study', title: 'X', startTime: '11:00', endTime: '12:00', isLocked: false },
    ],
    bounds
  );
  assert('leisure dropped', !r.blocks.find((b) => b.id === 'l'));
  assert('non-leisure survives', !!r.blocks.find((b) => b.id === 's'));
}

// restores moved locked block
{
  const original = [
    { id: 'lec', type: 'event', title: 'Lec', startTime: '09:00', endTime: '10:00', isLocked: true },
  ];
  const tampered = [
    { id: 'lec', type: 'event', title: 'Lec', startTime: '14:00', endTime: '15:00', isLocked: true },
  ];
  const r = validateAndRepair(tampered, bounds, original);
  const lec = r.blocks.find((b) => b.id === 'lec');
  assert('lock restored to original coords', lec?.startTime === '09:00' && lec?.endTime === '10:00', lec);
  assert('moved_lock violation logged', r.violations.some((v) => v.kind === 'moved_lock'));
}

// overlap repair: slides non-locked
{
  const r = validateAndRepair(
    [
      { id: 'a', type: 'study', title: 'A', startTime: '09:00', endTime: '10:00', isLocked: false },
      { id: 'b', type: 'study', title: 'B', startTime: '09:30', endTime: '10:30', isLocked: false },
    ],
    bounds
  );
  const a = r.blocks.find((b) => b.id === 'a');
  const b = r.blocks.find((b) => b.id === 'b');
  assert(
    'overlap slid',
    a && b && timeToMin(b.startTime) >= timeToMin(a.endTime),
    { a, b }
  );
}

// REGRESSION: 3+ mutually overlapping non-locked blocks must not leave residual overlap.
{
  const r = validateAndRepair(
    [
      { id: 'a', type: 'study', title: 'A', startTime: '09:00', endTime: '11:00', isLocked: false },
      { id: 'b', type: 'study', title: 'B', startTime: '09:30', endTime: '10:00', isLocked: false },
      { id: 'c', type: 'study', title: 'C', startTime: '10:15', endTime: '10:45', isLocked: false },
    ],
    bounds
  );
  const placed = r.blocks.sort((x, y) => timeToMin(x.startTime) - timeToMin(y.startTime));
  let ok = true;
  for (let i = 1; i < placed.length; i++) {
    if (timeToMin(placed[i].startTime) < timeToMin(placed[i - 1].endTime)) ok = false;
  }
  assert('3-block overlap repaired without residual', ok, placed);
}

// shabbat: relocate or tray
{
  const shabbatBounds = {
    wakeMin: 420, sleepMin: 1380,
    shabbat: { blockStartMin: 1080 /*18:00*/, blockEndMin: null },
  };
  const r = validateAndRepair(
    [
      { id: 'x', type: 'study', title: 'X', startTime: '19:00', endTime: '20:00', isLocked: false },
    ],
    shabbatBounds
  );
  const x = r.blocks.find((b) => b.id === 'x');
  if (x) {
    assert('shabbat: relocated before 18:00', timeToMin(x.endTime) <= 1080, x);
  } else {
    assert('shabbat: trayed', r.tray.some((b) => b.id === 'x' && b.trayReason === 'shabbat'));
  }
}

// ---------- chooseEngine ----------
{
  const blocks = [
    { id: 'a', source: 'task', type: 'study', title: 'A',
      startTime: '09:00', endTime: '10:00', duration: 60, isLocked: false },
  ];
  const det = chooseEngine({ kind: 'FINISH_EARLY', blockId: 'a', newEndTime: '09:30' }, blocks, bounds);
  assert('chooseEngine deterministic on FINISH_EARLY', det.engine === 'DETERMINISTIC');

  const ai = chooseEngine({ kind: 'MORNING_BUILD' }, [], bounds);
  assert('chooseEngine AI on MORNING_BUILD', ai.engine === 'AI');
}

// ---------- summary ----------
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  for (const f of fails) console.log('FAIL:', f.name, f.detail ?? '');
  process.exit(1);
}
