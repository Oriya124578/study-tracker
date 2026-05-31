import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { Button } from '../ui/button';
import { File, Upload, Trash2, Loader2, Download } from 'lucide-react';

export const CourseFiles = ({ courseId, selectedWeek }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      const userId = userData.user.id;

      // The path in storage where this week's files are expected to be.
      // E.g., <userId>/<courseId>/<selectedWeek>/ or just searching by courseId
      // Let's list all files for the course and filter, or if the upload script
      // just uploaded them with relative paths, we need to show them.
      // Since the upload script uploads with arbitrary paths, we can list everything under <userId>/<courseId>
      
      // To list recursively, Supabase Storage list doesn't support recursive listing out of the box unless we do prefix search.
      // Let's do a search with prefix `<userId>/${courseId}`
      const prefix = `${userId}/${courseId}`;
      const { data, error } = await supabase.storage.from('course_files').list(prefix, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
        search: '' // list all inside prefix
      });

      if (error) throw error;
      
      // Filtering files that might belong to the week?
      // Since the local files didn't have "week" in their paths automatically (they just had the directory structure),
      // for now we'll just show all course files. Or if they match "הרצאה N" -> week N...
      // To keep it simple, we just show all files for the course in this tab, or filter by week if they upload it via the UI.
      // We will add a "Week X" folder for UI uploads.
      setFiles(data || []);
      
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [courseId, selectedWeek]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const stringToHex = (str) => {
    return Array.from(new TextEncoder().encode(str))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const hexToString = (hex) => {
    const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    return new TextDecoder().decode(bytes);
  };

  const handleFileChange = async (e) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      const userId = userData.user.id;

      for (const file of selectedFiles) {
        // Encode using Hex
        const encodedFolder = stringToHex(`week_${selectedWeek}`);
        const encodedFileName = stringToHex(file.name);
        const path = `${userId}/${courseId}/${encodedFolder}/${encodedFileName}`;
        
        const { error } = await supabase.storage.from('course_files').upload(path, file, {
          upsert: true
        });

        if (error) {
          console.error('Error uploading file:', error);
          alert(`שגיאה בהעלאת הקובץ ${file.name}`);
        }
      }
      
      fetchFiles();
    } catch (err) {
      console.error('Error during upload:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // reset
    }
  };

  const handleDownload = async (file) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      const userId = userData.user.id;
      
      const path = `${userId}/${courseId}/${file.name}`; // file.name here is the path returned by list()
      const { data, error } = await supabase.storage.from('course_files').createSignedUrl(path, 3600); // 1 hour expiry
      
      if (error) throw error;
      
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  };

  const handleDelete = async (file) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את הקובץ?`)) return;
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      const userId = userData.user.id;
      
      const path = `${userId}/${courseId}/${file.name}`;
      const { error } = await supabase.storage.from('course_files').remove([path]);
      
      if (error) throw error;
      
      fetchFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  // Helper to decode a full path like hex1/hex2/hex3 back to normal string
  const decodePath = (hexPath) => {
    try {
      return hexPath.split('/').map(segment => hexToString(segment)).join('/');
    } catch(e) {
      return hexPath; // fallback
    }
  };

  return (
    <div className="mt-8 border rounded-2xl p-6 bg-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">קבצים ומסמכים</h3>
        <Button onClick={handleUploadClick} disabled={uploading} variant="outline" size="sm" className="gap-2">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          העלה קבצים
        </Button>
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange} 
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-xl">
          אין קבצים זמינים. לחץ על "העלה קבצים" כדי להוסיף.
        </div>
      ) : (
        <div className="grid gap-3">
          {files.map((file) => {
            const displayName = decodePath(file.name);
            return (
              <div key={file.id || file.name} className="flex items-center justify-between p-3 border rounded-xl hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium" dir="ltr">{displayName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleDownload(file)}>
                    <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(file)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
