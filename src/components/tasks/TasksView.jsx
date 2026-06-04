import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Circle, CheckCircle2, ChevronDown, Trash2, X, Star, Edit3,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { cn } from '../../lib/utils';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

// ── Helpers ──────────────────────────────────────────────────────────────────

const useDueDate = (dateStr, t) => {
  if (!dateStr) return null;
  try {
    const date = parseISO(dateStr);
    if (isToday(date))    return { label: t('todayLabel'),    color: 'text-amber-500' };
    if (isTomorrow(date)) return { label: t('tomorrowLabel'), color: 'text-blue-500' };
    if (isPast(date))     return { label: format(date, 'd/M'), color: 'text-red-500' };
    return { label: format(date, 'd MMM'), color: 'text-muted-foreground' };
  } catch { return null; }
};

// ── Star Toggle Button with Juicy Physics ──
const StarButton = ({ isStarred, onToggle, t }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      whileHover={{ scale: 1.15 }}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="p-1.5 rounded-full hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors shrink-0"
      aria-label={isStarred ? t('unstarTask') : t('starTask')}
    >
      <motion.div
        animate={{
          scale: isStarred ? [1, 1.35, 1] : 1,
          rotate: isStarred ? [0, 15, -15, 0] : 0,
        }}
        transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 15 }}
      >
        <Star
          className={cn(
            "w-4 h-4 transition-colors duration-200",
            isStarred 
              ? "fill-amber-400 text-amber-400" 
              : "text-muted-foreground/35 hover:text-amber-400"
          )}
        />
      </motion.div>
    </motion.button>
  );
};

// ── Edit/Add List Modal ──
const EditListModal = ({ onClose, onSave, onDelete, initialValue, isEdit = false, t, isRTL }) => {
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
            {isEdit ? t('editListName') : t('addNewList')}
          </h3>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t('listNamePlaceholder')}
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

// ── Sub-task row ─────────────────────────────────────────────────────────────

const SubtaskRow = ({ taskId, sub }) => {
  const { toggleSubtask, deleteSubtask } = useStore();
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 py-1.5 group/sub">
      <button
        onClick={() => toggleSubtask(taskId, sub.id)}
        className="shrink-0 transition-transform active:scale-90 rounded-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        role="checkbox"
        aria-checked={!!sub.done}
        aria-label={sub.title}
      >
        {sub.done
          ? <CheckCircle2 className="w-4 h-4 text-primary" />
          : <Circle className="w-4 h-4 text-muted-foreground/40 hover:text-primary transition-colors" />}
      </button>
      <span className={cn(
        'flex-1 text-sm',
        sub.done ? 'line-through text-muted-foreground' : 'text-foreground',
      )}>
        {sub.title}
      </span>
      <button
        onClick={() => deleteSubtask(taskId, sub.id)}
        className="opacity-0 group-hover/sub:opacity-100 transition-opacity p-1.5 rounded-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:opacity-100"
        aria-label={t('delete')}
      >
        <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors" />
      </button>
    </div>
  );
};

// ── Task row ─────────────────────────────────────────────────────────────────

const TaskRow = ({ task }) => {
  const { togglePersonalTask, deletePersonalTask, addSubtask, toggleStarPersonalTask, updatePersonalTask } = useStore();
  const { t, language } = useTranslation();
  const isRTL = language === 'he';
  const [expanded, setExpanded] = useState(false);
  const [newSub, setNewSub]     = useState('');
  const subInputRef = useRef(null);

  const dueDateInfo = useDueDate(task.dueDate, t);
  const subtasks    = task.subtasks || [];
  const doneSubs    = subtasks.filter((s) => s.done).length;

  const handleAddSub = () => {
    const label = newSub.trim();
    if (!label) return;
    addSubtask(task.id, label);
    setNewSub('');
  };

  return (
    <div className={cn('border-b border-border/60 last:border-0', task.done && 'opacity-55')}>
      {/* ── Main row ── */}
      <div className="flex items-center gap-3 px-4 py-3.5" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); togglePersonalTask(task.id); }}
          className="shrink-0 transition-transform active:scale-90 rounded-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          role="checkbox"
          aria-checked={!!task.done}
          aria-label={task.title}
        >
          {task.done
            ? <CheckCircle2 className="w-5 h-5 text-primary" />
            : <Circle className="w-5 h-5 text-muted-foreground/40 hover:text-primary transition-colors" />}
        </button>

        {/* Title + meta — tap to expand */}
        <button
          onClick={() => !task.done && setExpanded((v) => !v)}
          className="flex-1 flex items-center gap-2 text-start min-w-0 rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          aria-expanded={!task.done ? expanded : undefined}
          aria-controls={!task.done ? `task-subtasks-${task.id}` : undefined}
        >
          <span className={cn(
            'flex-1 text-[15px] font-medium text-foreground truncate',
            task.done && 'line-through text-muted-foreground',
          )}>
            {task.title}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            {subtasks.length > 0 && (
              <span className="text-xs text-muted-foreground">{doneSubs}/{subtasks.length}</span>
            )}
            {task.priority === 'high' && (
              <div className="w-2 h-2 rounded-full bg-red-500" />
            )}
            {task.priority === 'med' && (
              <div className="w-2 h-2 rounded-full bg-amber-500" />
            )}
            {dueDateInfo && (
              <span className={cn('text-xs font-medium', dueDateInfo.color)}>
                {dueDateInfo.label}
              </span>
            )}
            {!task.done && (
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.18 }}
              >
                <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
              </motion.div>
            )}
          </div>
        </button>

        {/* Star icon */}
        <StarButton
          isStarred={!!task.starred}
          onToggle={() => toggleStarPersonalTask(task.id)}
          t={t}
        />
      </div>

      {/* ── Expanded: subtasks ── */}
      <AnimatePresence initial={false}>
        {expanded && !task.done && (
          <motion.div
            key="subtasks"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              id={`task-subtasks-${task.id}`}
              className={cn('pb-3', isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4')}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Subtask list */}
              {subtasks.map((sub) => (
                <SubtaskRow key={sub.id} taskId={task.id} sub={sub} />
              ))}

              {/* Add subtask input */}
              <div className="flex items-center gap-2 mt-1 py-1">
                <Plus className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                <input
                  ref={subInputRef}
                  value={newSub}
                  onChange={(e) => setNewSub(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddSub(); }}
                  placeholder={t('subtaskPlaceholder')}
                  className="flex-1 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground/40"
                />
                {newSub.trim() && (
                  <button
                    onClick={handleAddSub}
                    className="text-xs font-bold text-primary"
                  >
                    {t('add')}
                  </button>
                )}
              </div>

              {/* Priority & Delete task */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground font-semibold me-1">{t('priority')}:</span>
                  {[
                    { value: 'high', label: t('priorityHigh'), color: 'bg-red-500 text-white' },
                    { value: 'med', label: t('priorityMed'), color: 'bg-amber-500 text-white' },
                    { value: 'low', label: t('priorityLow', 'רגילה'), color: 'bg-emerald-500 text-white' },
                  ].map((p) => {
                    const isActive = task.priority === p.value || (p.value === 'low' && !task.priority);
                    return (
                      <button
                        key={p.value}
                        onClick={() => updatePersonalTask(task.id, { priority: p.value })}
                        className={cn(
                          "px-2.5 py-1 rounded-xl font-bold text-[10px] transition-all active:scale-95 border",
                          isActive
                            ? p.color + " border-transparent shadow-sm"
                            : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                        )}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => deletePersonalTask(task.id)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t('deleteTask')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Main view ────────────────────────────────────────────────────────────────

export const TasksView = () => {
  const { data, addPersonalTask, openAddSheet, addTaskList, updateTaskList, deleteTaskList } = useStore();
  const { t, language } = useTranslation();
  const isRTL = language === 'he';
  const [activeTab, setActiveTab] = useState('personal');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const inputRef = useRef(null);

  // Construct lists
  const lists = [
    { id: 'favorites', name: t('favorites') },
    { id: 'personal', name: t('defaultListName') },
    ...(data?.taskLists || [])
  ];

  // Filter tasks based on activeTab
  const allTasks = data?.personalTasks || [];
  const filteredTasks = allTasks.filter((task) => {
    if (activeTab === 'favorites') return !!task.starred;
    return task.list === activeTab;
  });

  const pendingTasks  = filteredTasks.filter((t) => !t.done);
  const completedTasks = filteredTasks.filter((t) => t.done);

  const handleAddTask = async () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    const isFav = activeTab === 'favorites';
    await addPersonalTask({
      title,
      priority: 'low',
      list: isFav ? 'personal' : activeTab,
      starred: isFav
    });
    setNewTaskTitle('');
    inputRef.current?.focus();
  };

  const currentList = lists.find(l => l.id === activeTab);
  const isCustomList = activeTab !== 'favorites' && activeTab !== 'personal';

  return (
    <div
      className="max-w-2xl mx-auto w-full px-4 py-5 sm:px-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-400"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ── Top Tabs Slider Navigation ── */}
      <div className="flex items-center gap-1.5 pb-2 overflow-x-auto no-scrollbar border-b border-border/50">
        {lists.map((list) => {
          const isActive = activeTab === list.id;
          return (
            <button
              key={list.id}
              onClick={() => setActiveTab(list.id)}
              className={cn(
                "relative px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200 shrink-0 select-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                isActive ? "text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="relative z-10">{list.name}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTaskListTab"
                  className="absolute inset-0 bg-primary rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
        {/* "+" Button to add a new list */}
        <button
          onClick={() => setIsAddOpen(true)}
          className="p-2.5 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          aria-label={t('addNewList')}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* ── List Title + Options ── */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-extrabold text-foreground">
          {currentList ? currentList.name : ''}
        </h2>
        {isCustomList && (
          <button
            onClick={() => setIsEditOpen(true)}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            aria-label={t('editListName')}
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Quick-add bar ── */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border bg-card">
        <button
          onClick={() => openAddSheet('task', { list: activeTab === 'favorites' ? 'personal' : activeTab, starred: activeTab === 'favorites' })}
          className="shrink-0 w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          aria-label={t('addNewItem')}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <input
          ref={inputRef}
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(); }}
          placeholder={t('addTaskPlaceholder')}
          className="flex-1 text-[15px] text-foreground bg-transparent outline-none placeholder:text-muted-foreground"
        />
        {newTaskTitle.trim() && (
          <button
            onClick={handleAddTask}
            className="shrink-0 px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-xl active:scale-95 transition-transform"
          >
            {t('add')}
          </button>
        )}
      </div>

      {/* ── Pending tasks ── */}
      {pendingTasks.length === 0 && completedTasks.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground text-sm">
          {t('noPersonalTasks')}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {pendingTasks.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              🎉 {t('completedSection')}!
            </div>
          ) : (
            <motion.div layout className="divide-y divide-border/60">
              <AnimatePresence mode="popLayout">
                {pendingTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TaskRow task={task} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      )}

      {/* ── Completed section ── */}
      {completedTasks.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="w-full flex items-center gap-2 px-4 py-3.5 text-sm font-semibold text-muted-foreground hover:bg-muted/50 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset"
            dir={isRTL ? 'rtl' : 'ltr'}
            aria-expanded={showCompleted}
            aria-controls="completed-tasks-section"
          >
            <motion.div
              animate={{ rotate: showCompleted ? 0 : (isRTL ? 90 : -90) }}
              transition={{ duration: 0.18 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
            {t('completedSection')} ({completedTasks.length})
          </button>

          <AnimatePresence initial={false}>
            {showCompleted && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
                id="completed-tasks-section"
              >
                <div className="divide-y divide-border/60">
                  <AnimatePresence mode="popLayout">
                    {completedTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TaskRow task={task} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Add List Modal ── */}
      {isAddOpen && (
        <EditListModal
          onClose={() => setIsAddOpen(false)}
          onSave={async (name) => {
            const newId = await addTaskList(name);
            if (newId) setActiveTab(newId);
          }}
          t={t}
          isRTL={isRTL}
        />
      )}

      {/* ── Edit/Delete List Modal ── */}
      {isEditOpen && (
        <EditListModal
          onClose={() => setIsEditOpen(false)}
          isEdit={true}
          initialValue={currentList?.name}
          onSave={(name) => updateTaskList(activeTab, name)}
          onDelete={() => {
            if (window.confirm(t('confirmDeleteList'))) {
              deleteTaskList(activeTab);
              setActiveTab('personal');
            }
          }}
          t={t}
          isRTL={isRTL}
        />
      )}
    </div>
  );
};
