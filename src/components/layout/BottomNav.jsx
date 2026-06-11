import React from 'react';
import { Home, Calendar, BookOpen, Sparkles, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
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
      className="fixed bottom-0 inset-x-0 z-50 px-1 sm:px-3 flex justify-around items-center pt-1.5 pb-[calc(.4rem+env(safe-area-inset-bottom))]"
      style={{
        background: 'rgba(250,247,242,.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(180,140,80,.12)',
        // iOS WebKit: fixed + backdrop-filter detaches from the viewport while
        // scrolling unless the element gets its own compositing layer.
        transform: 'translateZ(0)',
        willChange: 'transform',
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
              'relative flex flex-col items-center gap-0.5 py-1 px-2 transition-colors min-w-[52px] rounded-xl active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset',
            )}
            style={{
              color: isActive ? '#059669' : 'rgba(42,26,10,.3)',
            }}
          >
            {/* Sliding pill behind the active tab (shared layoutId = spring slide) */}
            {isActive && (
              <motion.span
                layoutId="bottomNavPill"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="absolute inset-0 rounded-xl"
                style={{ background: 'rgba(5,150,105,.09)' }}
              />
            )}
            <motion.span
              animate={{ scale: isActive ? 1.12 : 1, y: isActive ? -1 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="relative flex items-center justify-center"
            >
              <Icon className="w-[18px] h-[18px]" style={{ opacity: isActive ? 1 : 0.3 }} />
            </motion.span>
            <span className="relative text-[9px] font-bold leading-none mt-0.5">
              {t(item.labelKey)}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
