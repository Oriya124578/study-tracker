// Backwards-compat shim. The Calori Life app has migrated to Firebase Storage —
// all storage helpers now live in `firebaseStorage.js`. We keep this module so
// existing imports (`useCourseFiles`, `MigrateLocalFiles`) don't have to be
// touched in this PR. Prefer the new module for new code.
export * from './firebaseStorage';
