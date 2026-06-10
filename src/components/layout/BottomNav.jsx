import React from 'react';
import { Home, Calendar, BookOpen, Sparkles, ShoppingCart } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../hooks/useTranslation';

// v3 cream redesign — 5 tabs. RTL right→left:
// ✨ Manager · 🛒 Shopping · 🏠 Home · 📅 Calendar · 📚 Studies
// Focus moved to FAB. Calori opens from Home Hero card tap. Tasks/Notes from FAB.
const NAV_ITEMS = [
  { key: 'commandCenter', icon: Sparkles,     labelKey: 'navManager',   activeColor: 'text-fitness-primary' },
  { key: 'shopping',      icon: ShoppingCart, labelKey: 'navShopping',  activeColor: 'text-nutrition-primary' },
  { key: 'overview',      icon: Home,         labelKey: 'navHome',      activeColor: 'text-nutrition-primary' },
  { key: 'calendar',      icon: Calendar,     labelKey: 'navCalendar',  activeColor: 'text-nutrition-primary' },
  { key: 'courses',       icon: BookOpen,     labelKey: 'navStudies',   activeColor: 'text-nutrition-primary' },
];

export const BottomNav = () => {
  const { activeCategory, setActiveCategory, setActiveCourse } = useStore();
  const { t } = useTranslation();

  const handleNavClick = (key) => {
    setActiveCategory(key);
    if (key !== 'course') setActiveCourse(null);
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 px-1 sm:px-3 flex justify-around items-center pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]"
      style={{
        background: 'rgba(250,247,242,.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(180,140,80,.12)',
        minHeight: '72px',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          activeCategory === item.key ||
          (item.key === 'courses' && (activeCategory === 'courses' || activeCategory === 'course'));

        return (
          <button
            key={item.key}
            onClick={() => handleNavClick(item.key)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center gap-0.5 py-1.5 px-2 transition-all min-w-[48px] rounded-xl hover:bg-muted/40 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset',
            )}
            style={{
              color: isActive ? '#059669' : 'rgba(42,26,10,.3)',
            }}
          >
            <Icon className="w-[18px] h-[18px]" style={{ opacity: isActive ? 1 : 0.25 }} />
            <span className="text-[10px] font-bold leading-none mt-1">
              {t(item.labelKey)}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
