import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, PinOff, Trash2, X, Palette, Plus, Edit3, MoreVertical } from 'lucide-react';
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

// ── Edit/Add Category Modal ──
const EditCategoryModal = ({ onClose, onSave, onDelete, initialValue, isEdit = false, t, isRTL }) => {
  const [value, setValue] = useState(initialValue || '');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        {/* Card */}
        <motion.div
          className="relative w-full max-w-sm overflow-hidden bg-card border border-border rounded-2xl p-5 shadow-xl z-10 space-y-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <h3 className="text-base font-bold text-foreground">
            {isEdit ? t('editCategoryName') : t('addNewCategory')}
          </h3>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t('categoryNamePlaceholder')}
            className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-muted/30 text-foreground outline-none focus:border-primary"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSave(value.trim());
                onClose();
              }
            }}
          />
          <div className="flex justify-end gap-2 text-xs font-bold pt-2">
            {isEdit && onDelete && (
              <button
                onClick={() => { onDelete(); onClose(); }}
                className="px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors me-auto"
              >
                {t('delete')}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={() => { onSave(value.trim()); onClose(); }}
              disabled={!value.trim()}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {t('save')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ── Edit Sheet ────────────────────────────────────────────────────────────────

const NoteEditSheet = ({ note, onClose }) => {
  const { updateQuickNote, deleteQuickNote, data } = useStore();
  const { t, language } = useTranslation();
  const isRTL = language === 'he';

  const [title,   setTitle]   = useState(note.title   || '');
  const [content, setContent] = useState(note.content || '');
  const [pinned,  setPinned]  = useState(!!note.pinned);
  const [color,   setColor]   = useState(note.color   ?? null);
  const [categoryId, setCategoryId] = useState(note.categoryId || 'general');

  const handleSave = () => {
    updateQuickNote(note.id, { title: title.trim(), content: content.trim(), pinned, color, categoryId });
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
          'fixed bottom-0 inset-x-0 z-[61] rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] max-h-[90dvh] overflow-y-auto',
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
                className="p-1.5 rounded-full hover:bg-foreground/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                aria-pressed={pinned}
                aria-label={pinned ? t('unpinNote') : t('pinNote')}
              >
                {pinned
                  ? <PinOff className="w-4 h-4 text-primary" />
                  : <Pin    className="w-4 h-4 text-muted-foreground" />}
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                aria-label={t('deleteNote')}
              >
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </button>
              <button
                onClick={handleSave}
                className="p-1.5 rounded-full hover:bg-foreground/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                aria-label={t('saveNote')}
              >
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

          {/* Category picker */}
          {data?.noteCategories?.length > 0 && (
            <div className="pt-2 border-t border-foreground/10 flex items-center gap-3">
              <span className="text-sm font-semibold text-muted-foreground shrink-0">{t('categoryLabel')}:</span>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="text-sm bg-transparent text-foreground outline-none cursor-pointer border border-foreground/10 rounded-lg px-2 py-1"
              >
                {data.noteCategories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-card text-foreground">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Color picker */}
          <div className="pt-2 border-t border-foreground/10">
            <div className="flex items-center gap-3">
              <Palette className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex gap-2" role="radiogroup" aria-label={t('noteColor')}>
                {NOTE_COLORS.map((c) => (
                  <button
                    key={String(c.id)}
                    onClick={() => setColor(c.id)}
                    role="radio"
                    aria-checked={color === c.id}
                    aria-label={c.id || t('none')}
                    className={cn(
                      'w-7 h-7 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none',
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
  const { data } = useStore();
  const dateStr = note.updatedAt || note.createdAt;
  let dateLabel = '';
  try { dateLabel = format(parseISO(dateStr), 'd/M'); } catch { /* ignore */ }
  const cat = data?.noteCategories?.find((c) => c.id === note.categoryId);

  return (
    <button
      onClick={() => onClick(note)}
      className={cn(
        'w-full text-start rounded-2xl border border-border p-3.5 transition-all hover:border-primary/40 active:scale-[0.98] duration-200',
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
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-foreground/5">
        {dateLabel && (
          <p className="text-[11px] text-muted-foreground">{dateLabel}</p>
        )}
        {cat && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-foreground/10 text-muted-foreground select-none">
            {cat.name}
          </span>
        )}
      </div>
    </button>
  );
};

// ── Main view ─────────────────────────────────────────────────────────────────

export const NotesView = () => {
  const { data, openAddSheet, addNoteCategory, updateNoteCategory, deleteNoteCategory } = useStore();
  const { t, language } = useTranslation();
  const isRTL = language === 'he';
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [editingNote, setEditingNote] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const allNotes     = data?.quickNotes || [];
  
  // Construct categories
  const categories = [
    { id: 'all', name: t('allNotesFilter') },
    { id: 'favorites', name: t('favorites') },
    ...(data?.noteCategories || [])
  ];

  // Filter notes
  const filteredNotes = selectedCategoryId === 'all'
    ? allNotes
    : selectedCategoryId === 'favorites'
    ? allNotes.filter((n) => !!n.pinned)
    : allNotes.filter((n) => n.categoryId === selectedCategoryId);

  const pinnedNotes  = filteredNotes.filter((n) => n.pinned);
  const regularNotes = filteredNotes.filter((n) => !n.pinned);

  const currentCategory = categories.find(c => c.id === selectedCategoryId);
  const isCustomCategory = selectedCategoryId !== 'all' && selectedCategoryId !== 'favorites' && selectedCategoryId !== 'general';

  return (
    <div
      className="max-w-2xl mx-auto w-full px-4 py-5 sm:px-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-400"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ── Dynamic Categories Scrollbar ── */}
      <div className="flex items-center gap-1.5 pb-2 overflow-x-auto no-scrollbar border-b border-border/50">
        {categories.map((cat) => {
          const isActive = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={cn(
                "relative px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200 shrink-0 select-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                isActive ? "text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="relative z-10">{cat.name}</span>
              {isActive && (
                <motion.div
                  layoutId="activeNoteCategoryTab"
                  className="absolute inset-0 bg-primary rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
        {/* "+" Button to add a new category */}
        <button
          onClick={() => setIsAddOpen(true)}
          className="p-2.5 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          aria-label={t('addNewCategory')}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* ── Category Title + Options ── */}
      {selectedCategoryId !== 'all' && (
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-extrabold text-foreground">
            {currentCategory ? currentCategory.name : ''}
          </h2>
          {isCustomCategory && (
            <button
              onClick={() => setIsEditOpen(true)}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              aria-label={t('editCategoryName')}
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ── Quick Note Creator Bar ── */}
      <div 
        onClick={() => openAddSheet('note', { 
          categoryId: (selectedCategoryId === 'all' || selectedCategoryId === 'favorites') ? 'general' : selectedCategoryId, 
          pinned: selectedCategoryId === 'favorites' 
        })}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border bg-card cursor-pointer hover:border-primary/40 active:scale-[0.99] transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      >
        <button
          className="shrink-0 w-6 h-6 rounded-full border border-primary/40 flex items-center justify-center bg-primary/5 text-primary"
          aria-label={t('addNewItem')}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <span className="text-[14px] text-muted-foreground font-medium select-none">
          {t('addNotePlaceholder')}
        </span>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground text-sm">
          <div className="text-4xl mb-3">🗒️</div>
          {t('noNotes')}
        </div>
      ) : (
        <motion.div layout className="space-y-4">
          {/* Pinned section */}
          {pinnedNotes.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-0.5">
                {t('pinnedNotes')}
              </p>
              <motion.div layout className="grid grid-cols-2 gap-2.5">
                <AnimatePresence mode="popLayout">
                  {pinnedNotes.map((n) => (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <NoteCard note={n} onClick={setEditingNote} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )}

          {/* Regular notes */}
          {regularNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-0.5">
                  {t('otherNotes')}
                </p>
              )}
              <motion.div layout className="grid grid-cols-2 gap-2.5">
                <AnimatePresence mode="popLayout">
                  {regularNotes.map((n) => (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <NoteCard note={n} onClick={setEditingNote} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}

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

      {/* Add Category Modal */}
      {isAddOpen && (
        <EditCategoryModal
          onClose={() => setIsAddOpen(false)}
          onSave={async (name) => {
            const newId = await addNoteCategory(name);
            if (newId) setSelectedCategoryId(newId);
          }}
          t={t}
          isRTL={isRTL}
        />
      )}

      {/* Edit Category Modal */}
      {isEditOpen && (
        <EditCategoryModal
          onClose={() => setIsEditOpen(false)}
          isEdit={true}
          initialValue={currentCategory?.name}
          onSave={(name) => updateNoteCategory(selectedCategoryId, name)}
          onDelete={() => {
            if (window.confirm(t('confirmDeleteCategory'))) {
              deleteNoteCategory(selectedCategoryId);
              setSelectedCategoryId('all');
            }
          }}
          t={t}
          isRTL={isRTL}
        />
      )}
    </div>
  );
};
