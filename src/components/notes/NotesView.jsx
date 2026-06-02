import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, PinOff, Trash2, X, Palette } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { cn } from '../../lib/utils';
import { format, parseISO } from 'date-fns';

// ── Color palette ─────────────────────────────────────────────────────────────

const NOTE_COLORS = [
  { id: null,     bg: 'bg-card',                                  swatch: 'bg-white border-2 border-border' },
  { id: 'yellow', bg: 'bg-yellow-100  dark:bg-yellow-900/40',     swatch: 'bg-yellow-300' },
  { id: 'green',  bg: 'bg-emerald-100 dark:bg-emerald-900/40',    swatch: 'bg-emerald-300' },
  { id: 'pink',   bg: 'bg-pink-100    dark:bg-pink-900/40',       swatch: 'bg-pink-300' },
  { id: 'purple', bg: 'bg-purple-100  dark:bg-purple-900/40',     swatch: 'bg-purple-300' },
  { id: 'blue',   bg: 'bg-blue-100    dark:bg-blue-900/40',       swatch: 'bg-blue-300' },
];

const getColorBg = (colorId) =>
  NOTE_COLORS.find((c) => c.id === colorId)?.bg ?? 'bg-card';

// ── Edit Sheet ────────────────────────────────────────────────────────────────

const NoteEditSheet = ({ note, onClose }) => {
  const { updateQuickNote, deleteQuickNote } = useStore();
  const { t, language } = useTranslation();
  const isRTL = language === 'he';

  const [title,   setTitle]   = useState(note.title   || '');
  const [content, setContent] = useState(note.content || '');
  const [pinned,  setPinned]  = useState(!!note.pinned);
  const [color,   setColor]   = useState(note.color   ?? null);

  const handleSave = () => {
    updateQuickNote(note.id, { title: title.trim(), content: content.trim(), pinned, color });
    onClose();
  };

  const handleDelete = () => {
    deleteQuickNote(note.id);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/40 z-[60]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleSave}
      />

      {/* Sheet */}
      <motion.div
        className={cn(
          'fixed bottom-0 inset-x-0 z-[61] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] max-h-[90dvh] overflow-y-auto',
          getColorBg(color),
        )}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-foreground/20" />
        </div>

        <div className="px-5 pb-8 pt-2 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button onClick={handleSave} className="text-sm font-bold text-primary">
              {t('saveNote')}
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPinned((v) => !v)}
                className="p-1.5 rounded-full hover:bg-foreground/10 transition-colors"
              >
                {pinned
                  ? <PinOff className="w-4 h-4 text-primary" />
                  : <Pin    className="w-4 h-4 text-muted-foreground" />}
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </button>
              <button onClick={handleSave}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('noteTitlePlaceholder')}
            className="w-full text-lg font-bold text-foreground bg-transparent outline-none placeholder:text-foreground/30"
            autoFocus
          />

          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('noteContentPlaceholder')}
            rows={6}
            className="w-full text-[15px] text-foreground bg-transparent outline-none placeholder:text-foreground/30 resize-none"
          />

          {/* Color picker */}
          <div className="pt-2 border-t border-foreground/10">
            <div className="flex items-center gap-3">
              <Palette className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex gap-2">
                {NOTE_COLORS.map((c) => (
                  <button
                    key={String(c.id)}
                    onClick={() => setColor(c.id)}
                    className={cn(
                      'w-7 h-7 rounded-full transition-all',
                      c.swatch,
                      color === c.id && 'ring-2 ring-offset-2 ring-primary scale-110',
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// ── Note card ─────────────────────────────────────────────────────────────────

const NoteCard = ({ note, onClick }) => {
  const dateStr = note.updatedAt || note.createdAt;
  let dateLabel = '';
  try { dateLabel = format(parseISO(dateStr), 'd/M'); } catch { /* ignore */ }

  return (
    <button
      onClick={() => onClick(note)}
      className={cn(
        'w-full text-start rounded-2xl border border-border/60 p-3.5 transition-all hover:shadow-md active:scale-[0.98]',
        getColorBg(note.color),
      )}
    >
      {note.pinned && (
        <Pin className="w-3.5 h-3.5 text-muted-foreground mb-1.5" />
      )}
      {note.title && (
        <h3 className="text-sm font-bold text-foreground mb-1 line-clamp-2">
          {note.title}
        </h3>
      )}
      {note.content && (
        <p className="text-xs text-foreground/70 line-clamp-4 leading-relaxed">
          {note.content}
        </p>
      )}
      {dateLabel && (
        <p className="text-[11px] text-muted-foreground mt-2">{dateLabel}</p>
      )}
    </button>
  );
};

// ── Main view ─────────────────────────────────────────────────────────────────

export const NotesView = () => {
  const { data, openAddSheet } = useStore();
  const { t, language } = useTranslation();
  const isRTL = language === 'he';
  const [editingNote, setEditingNote] = useState(null);

  const allNotes     = data?.quickNotes || [];
  const pinnedNotes  = allNotes.filter((n) => n.pinned);
  const regularNotes = allNotes.filter((n) => !n.pinned);

  return (
    <div
      className="max-w-2xl mx-auto w-full px-4 animate-in fade-in slide-in-from-bottom-4 duration-400"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {allNotes.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground text-sm">
          <div className="text-4xl mb-3">🗒️</div>
          {t('noNotes')}
        </div>
      ) : (
        <>
          {/* Pinned section */}
          {pinnedNotes.length > 0 && (
            <div className="mt-4 mb-3">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-0.5">
                {t('pinnedNotes')}
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {pinnedNotes.map((n) => (
                  <NoteCard key={n.id} note={n} onClick={setEditingNote} />
                ))}
              </div>
            </div>
          )}

          {/* Regular notes */}
          {regularNotes.length > 0 && (
            <div className="mt-4 mb-4">
              {pinnedNotes.length > 0 && (
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-0.5">
                  {t('otherNotes')}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2.5">
                {regularNotes.map((n) => (
                  <NoteCard key={n.id} note={n} onClick={setEditingNote} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="h-6" />

      {/* Edit Sheet */}
      <AnimatePresence>
        {editingNote && (
          <NoteEditSheet
            key={editingNote.id}
            note={editingNote}
            onClose={() => setEditingNote(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
