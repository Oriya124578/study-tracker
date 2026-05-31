// Single source of truth for Supabase Storage access of course files.
// One private bucket (`course_files`), one path scheme:
//   {userId}/{courseId}/{folder}/{storedName}
// where folder is e.g. `week_3` (weekly) or a category slug (global), and
// storedName is `${Date.now()}_${originalName}` for new uploads.
//
// Legacy files (uploaded by the old CourseFiles browser and the bulk scripts)
// live under hex-encoded folder/file segments — handled on display only.

import { supabase } from '../supabaseClient';

export const BUCKET = 'course_files';

// --- Hex helpers (legacy display support) ---------------------------------

export const stringToHex = (str) =>
  Array.from(new TextEncoder().encode(str))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

export const hexToString = (hex) => {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
  return new TextDecoder().decode(bytes);
};

// True if the string contains ASCII control characters (a sign that a hex
// "decode" was a false positive rather than real text).
const hasControlChars = (str) =>
  Array.from(str).some((ch) => ch.charCodeAt(0) < 32);

// Best-effort human-readable name for a stored object name.
// New uploads are stored as `${timestamp}_${hex(originalName)}` (hex keeps the
// storage key ASCII-safe — Supabase rejects non-ASCII keys like Hebrew names).
// Legacy files (old browser/scripts) are pure hex with no timestamp prefix.
export const decodeStoredName = (storedName) => {
  if (!storedName) return storedName;

  // Strip a leading timestamp prefix like "1699880000000_" first.
  let name = storedName.replace(/^\d{10,}_/, '');

  // Hex-decode when the remainder looks like hex (even length, hex chars only).
  if (/^[0-9a-f]+$/i.test(name) && name.length % 2 === 0) {
    try {
      const decoded = hexToString(name);
      if (!hasControlChars(decoded)) {
        name = decoded;
      }
    } catch {
      /* keep original */
    }
  }

  return name;
};

// --- Path + auth ----------------------------------------------------------

export const buildPath = (userId, courseId, folder, fileName) =>
  `${userId}/${courseId}/${folder}/${fileName}`;

export const getUserId = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
};

// --- CRUD -----------------------------------------------------------------

// Uploads a file and returns the metadata to persist in app state ({name, path}).
// The storage key hex-encodes the filename so non-ASCII names (e.g. Hebrew)
// and spaces don't produce an invalid Supabase storage key.
export const uploadFile = async ({ userId, courseId, folder, file }) => {
  const storedName = `${Date.now()}_${stringToHex(file.name)}`;
  const path = buildPath(userId, courseId, folder, storedName);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  return { name: file.name, path };
};

// Supabase `list()` is NOT recursive: a prefix listing returns folder
// placeholders (id === null) for nested folders. Walk one level into each
// folder to collect the actual files, returning their full path keys.
export const listFilesRecursive = async (userId, courseId) => {
  const base = `${userId}/${courseId}`;
  const { data: entries, error } = await supabase.storage
    .from(BUCKET)
    .list(base, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
  if (error) throw error;

  const results = [];
  for (const entry of entries || []) {
    if (entry.name === '.emptyFolderPlaceholder') continue;

    if (entry.id === null) {
      // It's a folder — list its contents.
      const folderPath = `${base}/${entry.name}`;
      const { data: inner, error: innerErr } = await supabase.storage
        .from(BUCKET)
        .list(folderPath, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
      if (innerErr) continue;
      for (const f of inner || []) {
        if (f.id === null || f.name === '.emptyFolderPlaceholder') continue;
        results.push({
          id: f.id,
          path: `${folderPath}/${f.name}`,
          displayName: decodeStoredName(f.name),
        });
      }
    } else {
      // A file directly under the course (rare).
      results.push({
        id: entry.id,
        path: `${base}/${entry.name}`,
        displayName: decodeStoredName(entry.name),
      });
    }
  }
  return results;
};

export const createSignedUrl = async (path, expiresIn = 3600) => {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
};

export const deleteFile = async (path) => {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
};
