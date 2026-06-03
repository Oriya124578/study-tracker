import { useState, useEffect, useCallback } from 'react';
import {
  getUserId,
  uploadFile,
  listFilesRecursive,
  createSignedUrl,
  deleteFile,
  decodeStoredName,
} from '../lib/courseFilesStorage';
import { toast } from '../store/useToast';
import { useTranslation } from './useTranslation';

// Centralizes all course-file storage interactions for the three surfaces
// (weekly tasks, global tasks, file browser). Pass `browse: true` to load the
// recursive file list for the browser view; task surfaces only need actions.
export const useCourseFiles = (courseId, { browse = false } = {}) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const refresh = useCallback(async () => {
    if (!browse || !courseId) return;
    setLoading(true);
    try {
      const userId = await getUserId();
      setFiles(await listFilesRecursive(userId, courseId));
    } catch (err) {
      console.error('Failed to list files', err);
      toast.error(t('fileListError'));
    } finally {
      setLoading(false);
    }
  }, [browse, courseId, t]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Uploads files under the given folder. Returns [{name, path}] for persistence.
  const upload = useCallback(
    async (folder, fileList) => {
      const filesArr = Array.from(fileList || []);
      if (filesArr.length === 0) return [];
      setUploading(true);
      const uploaded = [];
      try {
        const userId = await getUserId();
        for (const file of filesArr) {
          try {
            uploaded.push(await uploadFile({ userId, courseId, folder, file }));
          } catch (err) {
            console.error('Upload failed', err);
            if (err?.code === 'FILE_TOO_LARGE') {
              toast.error(`${t('fileTooLarge')}: ${file.name}`);
            } else {
              toast.error(`${t('fileUploadError')}: ${file.name}`);
            }
          }
        }
        if (uploaded.length > 0) toast.success(t('fileUploadSuccess'));
        if (browse) await refresh();
      } catch (err) {
        console.error('Upload failed', err);
        toast.error(t('fileUploadError'));
      } finally {
        setUploading(false);
      }
      return uploaded;
    },
    [courseId, browse, refresh, t]
  );

  const remove = useCallback(
    async (path) => {
      try {
        await deleteFile(path);
        if (browse) setFiles((prev) => prev.filter((f) => f.path !== path));
        return true;
      } catch (err) {
        console.error('Delete failed', err);
        toast.error(t('fileDeleteError'));
        return false;
      }
    },
    [browse, t]
  );

  const getSignedUrl = useCallback(
    async (path) => {
      try {
        return await createSignedUrl(path);
      } catch (err) {
        console.error('Signing failed', err);
        toast.error(t('fileOpenError'));
        return null;
      }
    },
    [t]
  );

  // Opens a stored file. Falls back to a legacy public `url` if no path exists.
  const openSigned = useCallback(
    async (file) => {
      const path = typeof file === 'string' ? file : file?.path;
      if (path) {
        // Open synchronously to bypass popup blocker
        const newWindow = window.open('about:blank', '_blank', 'noopener');
        const url = await getSignedUrl(path);
        if (url) {
          if (newWindow) newWindow.location.href = url;
          else window.location.href = url; // fallback if popup blocked entirely
        } else {
          if (newWindow) newWindow.close();
        }
        return;
      }
      if (file?.url) window.open(file.url, '_blank', 'noopener');
    },
    [getSignedUrl]
  );

  return {
    files,
    loading,
    uploading,
    refresh,
    upload,
    remove,
    openSigned,
    getSignedUrl,
    decodeStoredName,
  };
};
