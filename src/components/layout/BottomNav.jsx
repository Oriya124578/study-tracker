import React from 'react';
import { Home, Calendar, BookOpen, MoreHorizontal, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../hooks/useTranslation';

const NAV_ITEMS = [
  { key: 'overview', icon: Home, labelKey: 'navHome' },
  { key: 'calendar', icon: Calendar, labelKey: 'navCalendar' },
  { key: '__fab__', icon: Plus },
  { key: 'courses', icon: BookOpen, labelKey: 'navStudies' },
  { key: 'moreHub', icon: MoreHorizontal, labelKey: 'navMore' },
];

export const BottomNav = () => {
  const { activeCategory, setActiveCategory, setActiveCourse, openAddSheet } =
    useStore();
  const { t } = useTranslation();

  const handleNavClick = (key) => {
    if (key === '__fab__') {
      openAddSheet('task');
      return;
    }
    setActiveCategory(key);
    if (key !== 'course') setActiveCourse(null);
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-border z-50 px-2 sm:px-4 flex justify-around items-end shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
      {NAV_ITEMS.map((item) => {
        if (item.key === '__fab__') {
          return (
            <button
              key="fab"
              onClick={() => handleNavClick('__fab__')}
              className="relative -mt-5 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-transform"
              aria-label={t('addNewItem')}
            >
              <Plus className="w-7 h-7" strokeWidth={2.5} />
            </button>
          );
        }

        const Icon = item.icon;
        const isActive =
          activeCategory === item.key ||
          (item.key === 'courses' &&
            (activeCategory === 'courses' || activeCategory === 'course')) ||
          (item.key === 'moreHub' &&
            (activeCategory === 'moreHub' || activeCategory === 'tasks' ||
             activeCategory === 'notes'  || activeCategory === 'settings' ||
             activeCategory === 'calori'));

        return (
          <button
            key={item.key}
            onClick={() => handleNavClick(item.key)}
            className={cn(
              'flex flex-col items-center gap-0.5 py-2.5 px-3 transition-colors min-w-[52px]',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-medium leading-none">
              {t(item.labelKey)}
            </span>
          </button>
        );
      })}
      {/* Safe-area spacer for iOS */}
      <div className="absolute bottom-0 inset-x-0 h-[env(safe-area-inset-bottom)] bg-background/95" />
    </nav>
  );
};
