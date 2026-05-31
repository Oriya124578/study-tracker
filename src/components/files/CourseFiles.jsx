import React, { useRef } from 'react';
import { Button } from '../ui/button';
import { File, Upload, Trash2, Loader2, Download } from 'lucide-react';
import { useCourseFiles } from '../../hooks/useCourseFiles';
import { useTranslation } from '../../hooks/useTranslation';

export const CourseFiles = ({ courseId, selectedWeek }) => {
  const { t } = useTranslation();
  const { files, loading, uploading, upload, remove, openSigned } = useCourseFiles(
    courseId,
    { browse: true }
  );
  const fileInputRef = useRef(null);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    await upload(`week_${selectedWeek}`, e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (file) => {
    if (!window.confirm(t('confirmDeleteFile'))) return;
    await remove(file.path);
  };

  return (
    <div className="mt-8 border rounded-2xl p-6 bg-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">{t('filesAndDocs')}</h3>
        <Button
          onClick={handleUploadClick}
          disabled={uploading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {t('uploadFiles')}
        </Button>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          className="hidden"
          aria-label={t('uploadFiles')}
          onChange={handleFileChange}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-xl">
          {t('noFilesAvailable')}
        </div>
      ) : (
        <div className="grid gap-3">
          {files.map((file) => (
            <div
              key={file.id || file.path}
              className="flex items-center justify-between p-3 border rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <File className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium truncate" dir="ltr">
                  {file.displayName}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openSigned(file)}
                  aria-label={`${t('uploadFiles')}: ${file.displayName}`}
                >
                  <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(file)}
                  aria-label={`${t('deleteFileTitle')}: ${file.displayName}`}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
