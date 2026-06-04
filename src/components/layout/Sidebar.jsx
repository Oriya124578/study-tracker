import React from 'react';
import { Home, Calendar, Settings, BookOpen, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { useTranslation } from '../../hooks/useTranslation';

export const Sidebar = () => {
  const { data, activeCourse, activeCategory, setActiveCourse, setActiveCategory, sidebarOpen, setSidebarOpen } = useStore();
  const { t } = useTranslation();
  const displayName = data?.profile?.displayName || 'User';

  const handleNavClick = (category, course = null) => {
    setActiveCategory(category);
    setActiveCourse(course);
  };

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex flex-col h-[100dvh] sticky top-0 bg-background border-l border-border transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
             {sidebarOpen && (
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-primary" />
                 </div>
                 <div>
                    <h1 className="font-bold text-sm text-foreground">Calori Life</h1>
                    <p className="text-[10px] text-muted-foreground">{displayName}</p>
                 </div>
               </div>
             )}
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground hidden lg:block">
               {sidebarOpen ? <PanelRightClose className="w-5 h-5"/> : <PanelLeftClose className="w-5 h-5"/>}
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-2 px-2">
          {/* Main Nav */}
          <div className="space-y-1 mb-6">
            <Button 
              variant={activeCategory === 'overview' && !activeCourse ? 'secondary' : 'ghost'} 
              className={cn("w-full justify-start", !sidebarOpen && "justify-center px-0")}
              onClick={() => handleNavClick('overview')}
              title={t('dashboard')}
            >
              <Home className={cn("w-5 h-5", sidebarOpen && "ml-3")} />
              {sidebarOpen && <span>{t('dashboard')}</span>}
            </Button>
            <Button 
              variant={activeCategory === 'calendar' ? 'secondary' : 'ghost'} 
              className={cn("w-full justify-start", !sidebarOpen && "justify-center px-0")}
              onClick={() => handleNavClick('calendar')}
              title={t('calendar')}
            >
              <Calendar className={cn("w-5 h-5", sidebarOpen && "ml-3")} />
              {sidebarOpen && <span>{t('calendar')}</span>}
            </Button>
          </div>

          {/* Courses */}
          {sidebarOpen && <h2 className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">{t('myCourses')}</h2>}
          <div className="space-y-1">
            {data?.courses?.filter(c => !c.isArchived).map(course => {
              const isActive = activeCourse?.id === course.id && activeCategory !== 'overview' && activeCategory !== 'calendar';
              return (
                <Button
                  key={course.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn("w-full justify-start relative", !sidebarOpen && "justify-center px-0")}
                  onClick={() => handleNavClick('course', course)}
                  title={course.name}
                >
                  <div className={cn("w-2.5 h-2.5 rounded-full bg-primary", sidebarOpen && "ml-3")} />
                  {sidebarOpen && <span className="truncate">{course.name}</span>}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-border flex flex-col gap-2">
          <Button 
            variant={activeCategory === 'settings' ? 'secondary' : 'ghost'} 
            className={cn("w-full justify-start text-muted-foreground", !sidebarOpen && "justify-center px-0")}
            onClick={() => handleNavClick('settings')}
            title={t('settings')}
          >
            <Settings className={cn("w-5 h-5", sidebarOpen && "ml-3")} />
            {sidebarOpen && <span>{t('settings')}</span>}
          </Button>
        </div>
      </aside>
    </>
  );
};
