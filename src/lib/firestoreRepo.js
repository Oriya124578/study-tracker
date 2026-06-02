// Firestore repository for the Calori Life app.
// All data is scoped per-user under `users/{uid}/...`. Subscribe-style helpers
// return the `onSnapshot` unsubscribe function; callers are responsible for
// invoking it on cleanup. Mutating helpers are async and throw on error.

import {
  collection,
  doc,
  deleteDoc,
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// --- Path helpers ---------------------------------------------------------

const profileDoc = (uid) => doc(db, 'users', uid, 'cl_profile', 'main');
const coursesCol = (uid) => collection(db, 'users', uid, 'cl_courses');
const courseDoc = (uid, courseId) => doc(db, 'users', uid, 'cl_courses', courseId);
const courseTasksCol = (uid) => collection(db, 'users', uid, 'cl_courseTasks');
const courseTaskDoc = (uid, taskId) => doc(db, 'users', uid, 'cl_courseTasks', taskId);
const pomodoroCol = (uid) => collection(db, 'users', uid, 'cl_pomodoroSessions');
const pomodoroDoc = (uid, sessionId) =>
  doc(db, 'users', uid, 'cl_pomodoroSessions', sessionId);
const eventsCol = (uid) => collection(db, 'users', uid, 'cl_events');
const eventDoc = (uid, id) => doc(db, 'users', uid, 'cl_events', id);
const personalTasksCol = (uid) =>
  collection(db, 'users', uid, 'cl_personalTasks');
const personalTaskDoc = (uid, id) =>
  doc(db, 'users', uid, 'cl_personalTasks', id);
const notesCol = (uid) => collection(db, 'users', uid, 'cl_notes');
const noteDoc = (uid, id) => doc(db, 'users', uid, 'cl_notes', id);

// New id helper for client-minted documents.
export const newId = (uid, kind) => {
  const col =
    kind === 'event'
      ? eventsCol(uid)
      : kind === 'personalTask'
      ? personalTasksCol(uid)
      : kind === 'note'
      ? notesCol(uid)
      : null;
  if (!col) throw new Error(`newId: unknown kind ${kind}`);
  return doc(col).id;
};

// Map a QuerySnapshot to a plain array of {id, ...data} so callers don't have
// to know about Firestore snapshot shapes.
const snapshotToArray = (snap) =>
  snap.docs.map((d) => ({ id: d.id, ...d.data() }));

// --- Profile --------------------------------------------------------------

/**
 * Subscribe to the user's profile doc. Calls `cb(profile|null)` whenever it
 * changes. Returns an unsubscribe function.
 */
export const subscribeProfile = (uid, cb) =>
  onSnapshot(profileDoc(uid), (snap) => {
    cb(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });

/** Merge-write the profile doc. */
export const setProfile = async (uid, profileObj) => {
  await setDoc(profileDoc(uid), profileObj, { merge: true });
};

// --- Courses --------------------------------------------------------------

/**
 * Subscribe to the user's courses collection. cb receives an array of
 * {id, ...data}. Returns an unsubscribe function.
 */
export const subscribeCourses = (uid, cb) =>
  onSnapshot(coursesCol(uid), (snap) => cb(snapshotToArray(snap)));

/** Merge-write a course doc. */
export const setCourse = async (uid, courseId, data) => {
  await setDoc(courseDoc(uid, courseId), data, { merge: true });
};

/**
 * Delete a course and all of its related course tasks atomically (single
 * batch). Tasks are matched by `courseId` field rather than by ID prefix.
 */
export const deleteCourse = async (uid, courseId) => {
  const tasksSnap = await getDocs(courseTasksCol(uid));
  const batch = writeBatch(db);
  batch.delete(courseDoc(uid, courseId));
  tasksSnap.forEach((t) => {
    if (t.data().courseId === courseId) {
      batch.delete(t.ref);
    }
  });
  await batch.commit();
};

// --- Course tasks ---------------------------------------------------------

/** Subscribe to all course tasks for the user. Returns unsubscribe. */
export const subscribeCourseTasks = (uid, cb) =>
  onSnapshot(courseTasksCol(uid), (snap) => cb(snapshotToArray(snap)));

/** Merge-write a single course task. */
export const setCourseTask = async (uid, taskId, data) => {
  await setDoc(courseTaskDoc(uid, taskId), data, { merge: true });
};

/** Delete a single course task by id. */
export const deleteCourseTask = async (uid, taskId) => {
  await deleteDoc(courseTaskDoc(uid, taskId));
};

/**
 * Batch merge-write many course tasks at once.
 * @param {string} uid
 * @param {Object<string, object>} tasksMap - { taskId: data }
 */
export const batchSetCourseTasks = async (uid, tasksMap) => {
  const batch = writeBatch(db);
  for (const [taskId, data] of Object.entries(tasksMap)) {
    batch.set(courseTaskDoc(uid, taskId), data, { merge: true });
  }
  await batch.commit();
};

// --- Pomodoro sessions ----------------------------------------------------

/** Subscribe to all pomodoro sessions for the user. Returns unsubscribe. */
export const subscribePomodoroSessions = (uid, cb) =>
  onSnapshot(pomodoroCol(uid), (snap) => cb(snapshotToArray(snap)));

/**
 * Add a pomodoro session with an auto-generated id. Returns the new id.
 * Uses `doc(col)` to mint a client-side id so we can return it synchronously.
 */
export const addPomodoroSession = async (uid, sessionData) => {
  const ref = doc(pomodoroCol(uid));
  await setDoc(ref, sessionData);
  return ref.id;
};

/** Delete a pomodoro session by id. */
export const deletePomodoroSession = async (uid, sessionId) => {
  await deleteDoc(pomodoroDoc(uid, sessionId));
};

// --- Events (cl_events) ---------------------------------------------------

export const subscribeEvents = (uid, cb) =>
  onSnapshot(eventsCol(uid), (snap) => cb(snapshotToArray(snap)));

export const setEvent = async (uid, id, data) => {
  await setDoc(eventDoc(uid, id), data, { merge: true });
};

export const deleteEvent = async (uid, id) => {
  await deleteDoc(eventDoc(uid, id));
};

// --- Personal tasks (cl_personalTasks) ------------------------------------

export const subscribePersonalTasks = (uid, cb) =>
  onSnapshot(personalTasksCol(uid), (snap) => cb(snapshotToArray(snap)));

export const setPersonalTask = async (uid, id, data) => {
  await setDoc(personalTaskDoc(uid, id), data, { merge: true });
};

export const deletePersonalTask = async (uid, id) => {
  await deleteDoc(personalTaskDoc(uid, id));
};

// --- Quick notes (cl_notes) -----------------------------------------------

export const subscribeNotes = (uid, cb) =>
  onSnapshot(notesCol(uid), (snap) => cb(snapshotToArray(snap)));

export const setNote = async (uid, id, data) => {
  await setDoc(noteDoc(uid, id), data, { merge: true });
};

export const deleteNote = async (uid, id) => {
  await deleteDoc(noteDoc(uid, id));
};
