import React from 'react';
import { Home, Calendar, BookOpen, Bot, Settings } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../hooks/useTranslation';

const NAV_ITEMS = [
  { key: 'commandCenter', icon: Bot, labelKey: 'navCommandCenter' },
  { key: 'overview', icon: Home, labelKey: 'navHome' },
  { key: 'courses', icon: BookOpen, labelKey: 'navStudies' },
];

export const BottomNav = () => {
  const { activeCategory, setActiveCategory, setActiveCourse } = useStore();
  const { t } = useTranslation();

  const handleNavClick = (key) => {
    setActiveCategory(key);
    if (key !== 'course') setActiveCourse(null);
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-border z-50 px-2 sm:px-4 flex justify-around items-center h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          activeCategory === item.key ||
          (item.key === 'courses' && (activeCategory === 'courses' || activeCategory === 'course')) ||
          (item.key === 'commandCenter' && (activeCategory === 'commandCenter' || activeCategory === 'calendar'));

        return (
          <button
            key={item.key}
            onClick={() => handleNavClick(item.key)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center gap-0.5 py-1.5 px-3 transition-all min-w-[56px] rounded-xl hover:bg-muted/40 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-bold leading-none mt-1">
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
