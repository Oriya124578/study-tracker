import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Bell, BookOpen, Flag, MapPin, Check, Clock, CheckSquare, FolderOpen } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { toast } from '../../store/useToast';
import { cn } from '../../lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

const TABS = ['event', 'task', 'note'];

const PRIORITY_OPTIONS = [
  { value: 'high', color: 'bg-red-500' },
  { value: 'med', color: 'bg-amber-500' },
  { value: 'low', color: 'bg-emerald-500' },
];

export const AddItemSheet = () => {
  const {
    showAddSheet,
    addSheetInitialTab,
    addSheetPrefill,
    closeAddSheet,
    addEvent,
    addPersonalTask,
    addQuickNote,
    data,
  } = useStore();
  const { t, language } = useTranslation();
  const isRTL = language === 'he';

  const [activeTab, setActiveTab] = useState('task');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [priority, setPriority] = useState('low');
  const [courseId, setCourseId] = useState('');
  const [location, setLocation] = useState('');
  const [reminder, setReminder] = useState('default'); // 'default' | 'none' | minutes(string)
  const [list, setList] = useState('personal');
  const [categoryId, setCategoryId] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (showAddSheet) {
      setActiveTab(addSheetInitialTab || 'task');
      setTitle('');
      setContent('');
      setDueDate(addSheetPrefill?.date || '');
      setStartTime('');
      setEndTime('');
      setAllDay(false);
      setPriority('low');
      setCourseId(addSheetPrefill?.courseId || '');
      setLocation('');
      setReminder('default');
      setList(addSheetPrefill?.list || 'personal');
      setCategoryId(addSheetPrefill?.categoryId || 'general');
      setSubmitting(false);
      setTimeout(() => titleRef.current?.focus(), 350);
    }
  }, [showAddSheet, addSheetInitialTab, addSheetPrefill]);

  const handleSubmit = async () => {
    if (activeTab !== 'note' && !title.trim()) {
      toast.error(t('titleRequired'));
      return;
    }
    if (activeTab === 'note' && !title.trim() && !content.trim()) {
      toast.error(t('titleRequired'));
      return;
    }
    // Convert reminder choice → reminderMinutes (null=default, -1=off, >=0 minutes).
    const reminderMinutes =
      reminder === 'default' ? null : reminder === 'none' ? -1 : Number(reminder);

    setSubmitting(true);
    try {
      if (activeTab === 'event') {
        await addEvent({
          title: title.trim(),
          start: dueDate ? (allDay ? dueDate : `${dueDate}T${startTime || '09:00'}`) : null,
          end: dueDate ? (allDay ? dueDate : `${dueDate}T${endTime || startTime || '10:00'}`) : null,
          allDay,
          location: location.trim(),
          courseId: courseId || null,
          reminderMinutes,
        });
      } else if (activeTab === 'task') {
        await addPersonalTask({
          title: title.trim(),
          dueDate: dueDate || null,
          priority,
          list,
          starred: !!addSheetPrefill?.starred,
          courseId: courseId || null,
          reminderMinutes,
        });
      } else {
        await addQuickNote({
          title: title.trim(),
          content: content.trim(),
          categoryId,
          pinned: !!addSheetPrefill?.pinned,
          courseId: courseId || null,
        });
      }
      toast.success(t('addedSuccessfully'));
      closeAddSheet();
    } catch {
      toast.error('Error');
    } finally {
      setSubmitting(false);
    }
  };

  const tabLabels = {
    event: t('tabEvent'),
    task: t('tabTask'),
    note: t('tabNote'),
  };

  const activeCourses = data?.courses?.filter((c) => !c.isArchived) || [];

  return (
    <AnimatePresence>
      {showAddSheet && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAddSheet}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 inset-x-0 z-[61] bg-background rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] max-h-[92dvh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1.5 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-5 pb-8 pt-2">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold text-foreground">
                  {t('addNewItem')}
                </h2>
                <button
                  onClick={closeAddSheet}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                  aria-label={t('cancel')}
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Segment Tabs */}
              <div className="flex bg-muted rounded-xl p-1 gap-0.5 mb-5" role="tablist">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={activeTab === tab}
                    className={cn(
                      'flex-1 text-center text-sm font-semibold py-2.5 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
                      activeTab === tab
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tabLabels[tab]}
                  </button>
                ))}
              </div>

              {/* Title Input */}
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  activeTab === 'event'
                    ? t('eventTitlePlaceholder')
                    : activeTab === 'task'
                    ? t('taskTitlePlaceholder')
                    : t('noteTitlePlaceholder')
                }
                className="w-full px-4 py-3.5 border-[1.5px] border-border rounded-2xl text-[15px] font-medium text-foreground bg-muted/30 outline-none transition-colors focus:border-primary focus:bg-background mb-4"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />

              {/* Note content textarea */}
              {activeTab === 'note' && (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('noteContentPlaceholder')}
                  rows={4}
                  className="w-full px-4 py-3 border-[1.5px] border-border rounded-2xl text-sm text-foreground bg-muted/30 outline-none transition-colors focus:border-primary focus:bg-background mb-4 resize-none"
                />
              )}

              {/* Form fields */}
              <div className="mb-5 divide-y divide-border">
                {/* Note Category selector (note only) */}
                {activeTab === 'note' && data?.noteCategories?.length > 0 && (
                  <FormRow
                    icon={<FolderOpen className="w-[18px] h-[18px] text-amber-600" />}
                    iconBg="bg-amber-100 dark:bg-amber-900/30"
                    label={t('categoryLabel')}
                  >
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="text-sm bg-transparent text-foreground outline-none cursor-pointer appearance-none text-end"
                    >
                      {data.noteCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </FormRow>
                )}

                {/* Task List selector (task only) */}
                {activeTab === 'task' && data?.taskLists?.length > 0 && (
                  <FormRow
                    icon={<CheckSquare className="w-[18px] h-[18px] text-emerald-600" />}
                    iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                    label={t('listLabel')}
                  >
                    <select
                      value={list}
                      onChange={(e) => setList(e.target.value)}
                      className="text-sm bg-transparent text-foreground outline-none cursor-pointer appearance-none text-end"
                    >
                      {data.taskLists.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </FormRow>
                )}

                {/* Date */}
                {activeTab !== 'note' && (
                  <FormRow
                    icon={<Calendar className="w-[18px] h-[18px] text-purple-600" />}
                    iconBg="bg-purple-100 dark:bg-purple-900/30"
                    label={activeTab === 'event' ? t('startTime') : t('dueDate')}
                  >
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="text-sm bg-transparent text-foreground outline-none cursor-pointer"
                    />
                  </FormRow>
                )}

                {/* Time (event only) */}
                {activeTab === 'event' && !allDay && (
                  <FormRow
                    icon={<Clock className="w-[18px] h-[18px] text-blue-600" />}
                    iconBg="bg-blue-100 dark:bg-blue-900/30"
                    label={t('endTime')}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="text-sm bg-transparent text-foreground outline-none w-24"
                      />
                      <span className="text-muted-foreground">-</span>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="text-sm bg-transparent text-foreground outline-none w-24"
                      />
                    </div>
                  </FormRow>
                )}

                {/* All-day toggle (event only) */}
                {activeTab === 'event' && (
                  <FormRow
                    icon={<Calendar className="w-[18px] h-[18px] text-emerald-600" />}
                    iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                    label={t('allDay')}
                  >
                    <button
                      onClick={() => setAllDay(!allDay)}
                      role="switch"
                      aria-checked={allDay}
                      aria-label={t('allDay')}
                      className={cn(
                        'w-11 h-6 rounded-full transition-colors flex items-center px-0.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none',
                        allDay ? 'bg-primary' : 'bg-muted-foreground/30',
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full bg-white shadow transition-transform',
                          allDay ? 'translate-x-5' : 'translate-x-0',
                        )}
                        style={isRTL && allDay ? { transform: 'translateX(-1.25rem)' } : isRTL ? { transform: 'translateX(0)' } : undefined}
                      />
                    </button>
                  </FormRow>
                )}

                {/* Location (event only) */}
                {activeTab === 'event' && (
                  <FormRow
                    icon={<MapPin className="w-[18px] h-[18px] text-rose-500" />}
                    iconBg="bg-rose-100 dark:bg-rose-900/30"
                    label={t('location')}
                  >
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="..."
                      className="text-sm bg-transparent text-foreground outline-none w-full text-end"
                    />
                  </FormRow>
                )}

                {/* Course selector */}
                {activeTab !== 'note' && activeCourses.length > 0 && (
                  <FormRow
                    icon={<BookOpen className="w-[18px] h-[18px] text-blue-600" />}
                    iconBg="bg-blue-100 dark:bg-blue-900/30"
                    label={t('course')}
                  >
                    <select
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      className="text-sm bg-transparent text-foreground outline-none cursor-pointer appearance-none"
                    >
                      <option value="">{t('none')}</option>
                      {activeCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </FormRow>
                )}

                {/* Priority (task only) */}
                {activeTab === 'task' && (
                  <FormRow
                    icon={<Flag className="w-[18px] h-[18px] text-red-500" />}
                    iconBg="bg-red-100 dark:bg-red-900/30"
                    label={t('priority')}
                  >
                    <div className="flex items-center gap-2" role="radiogroup" aria-label={t('priority')}>
                      {PRIORITY_OPTIONS.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => setPriority(p.value)}
                          role="radio"
                          aria-checked={priority === p.value}
                          aria-label={
                            p.value === 'high'
                              ? t('priorityHigh')
                              : p.value === 'med'
                              ? t('priorityMed')
                              : t('priorityLow')
                          }
                          className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center transition-all border-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none',
                            p.color,
                            priority === p.value
                              ? 'border-foreground scale-110 shadow-md'
                              : 'border-transparent',
                          )}
                        >
                          {priority === p.value && (
                            <Check className="w-3.5 h-3.5 text-white" />
                          )}
                        </button>
                      ))}
                      <span className="text-xs font-semibold text-primary ms-1">
                        {priority === 'high'
                          ? t('priorityHigh')
                          : priority === 'med'
                          ? t('priorityMed')
                          : t('priorityLow')}
                      </span>
                    </div>
                  </FormRow>
                )}

                {/* Reminder (event + task) */}
                {activeTab !== 'note' && (
                  <FormRow
                    icon={<Bell className="w-[18px] h-[18px] text-primary" />}
                    iconBg="bg-primary/10"
                    label={t('reminderLabel')}
                  >
                    <select
                      value={reminder}
                      onChange={(e) => setReminder(e.target.value)}
                      className="text-sm bg-transparent text-foreground outline-none cursor-pointer appearance-none text-end"
                    >
                      <option value="default">{t('reminderDefault')}</option>
                      <option value="none">{t('reminderNone')}</option>
                      <option value="0">{t('reminderAtTime')}</option>
                      <option value="10">{`10 ${t('caloriMinutes')}`}</option>
                      <option value="30">{`30 ${t('caloriMinutes')}`}</option>
                      <option value="60">{`60 ${t('caloriMinutes')}`}</option>
                      <option value="1440">{t('reminderDayBefore')}</option>
                    </select>
                  </FormRow>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {activeTab === 'event'
                  ? t('addEventBtn')
                  : activeTab === 'task'
                  ? t('addTaskBtn')
                  : t('addNoteBtn')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const FormRow = ({ icon, iconBg, label, children }) => (
  <div className="flex items-center gap-3 py-3.5">
    <div
      className={cn(
        'w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0',
        iconBg,
      )}
    >
      {icon}
    </div>
    <div className="flex-1 text-sm font-medium text-foreground">{label}</div>
    <div className="shrink-0">{children}</div>
  </div>
);
