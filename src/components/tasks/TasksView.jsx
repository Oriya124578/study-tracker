import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Circle, CheckCircle2, ChevronDown, Trash2, X,
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
  const { togglePersonalTask, deletePersonalTask, addSubtask } = useStore();
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

              {/* Delete task */}
              <div className="flex justify-end mt-2 pt-2 border-t border-border/40">
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
  const { data, addPersonalTask, openAddSheet } = useStore();
  const { t, language } = useTranslation();
  const isRTL = language === 'he';
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const inputRef = useRef(null);

  const allTasks      = data?.personalTasks || [];
  const pendingTasks  = allTasks.filter((t) => !t.done);
  const completedTasks = allTasks.filter((t) => t.done);

  const handleAddTask = async () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    await addPersonalTask({ title, priority: 'low' });
    setNewTaskTitle('');
    inputRef.current?.focus();
  };

  return (
    <div
      className="max-w-2xl mx-auto w-full px-0 animate-in fade-in slide-in-from-bottom-4 duration-400"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ── Quick-add bar ── */}
      <div className="mx-4 mt-4 mb-3 flex items-center gap-3 px-4 py-3 rounded-2xl border border-border bg-card shadow-sm">
        <button
          onClick={() => openAddSheet('task')}
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
            className="shrink-0 px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg active:scale-95 transition-transform"
          >
            {t('add')}
          </button>
        )}
      </div>

      {/* ── Pending tasks ── */}
      {pendingTasks.length === 0 && completedTasks.length === 0 ? (
        <div className="mx-4 py-20 text-center text-muted-foreground text-sm">
          {t('noPersonalTasks')}
        </div>
      ) : (
        <div className="mx-4 rounded-2xl border border-border bg-card overflow-hidden">
          {pendingTasks.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              🎉 {t('completedSection')}!
            </div>
          ) : (
            pendingTasks.map((task) => <TaskRow key={task.id} task={task} />)
          )}
        </div>
      )}

      {/* ── Completed section ── */}
      {completedTasks.length > 0 && (
        <div className="mx-4 mt-3 rounded-2xl border border-border bg-card overflow-hidden mb-2">
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
                {completedTasks.map((task) => <TaskRow key={task.id} task={task} />)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="h-6" />
    </div>
  );
};
