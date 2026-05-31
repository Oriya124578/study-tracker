import React from 'react';
import { Home, Calendar, Settings, BookOpen, Clock, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

export const Sidebar = () => {
  const { data, activeCourse, activeCategory, setActiveCourse, setActiveCategory, sidebarOpen, setSidebarOpen } = useStore();

  const handleNavClick = (category, course = null) => {
    setActiveCategory(category);
    setActiveCourse(course);
  };

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex flex-col h-screen bg-background border-l border-border transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-border h-16">
          {sidebarOpen && <h1 className="font-bold text-xl text-primary flex items-center gap-2"><BookOpen className="w-6 h-6"/> Study Tracker</h1>}
          {!sidebarOpen && <BookOpen className="w-6 h-6 text-primary mx-auto"/>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground hidden lg:block">
            {sidebarOpen ? <PanelRightClose className="w-5 h-5"/> : <PanelLeftClose className="w-5 h-5"/>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-2 px-2">
          {/* Main Nav */}
          <div className="space-y-1 mb-6">
            <Button 
              variant={activeCategory === 'overview' && !activeCourse ? 'secondary' : 'ghost'} 
              className={cn("w-full justify-start", !sidebarOpen && "justify-center px-0")}
              onClick={() => handleNavClick('overview')}
              title="דשבורד"
            >
              <Home className={cn("w-5 h-5", sidebarOpen && "ml-3")} />
              {sidebarOpen && <span>דשבורד ראשי</span>}
            </Button>
            <Button 
              variant={activeCategory === 'calendar' ? 'secondary' : 'ghost'} 
              className={cn("w-full justify-start", !sidebarOpen && "justify-center px-0")}
              onClick={() => handleNavClick('calendar')}
              title="לוח שנה"
            >
              <Calendar className={cn("w-5 h-5", sidebarOpen && "ml-3")} />
              {sidebarOpen && <span>לוח שנה</span>}
            </Button>
          </div>

          {/* Courses */}
          {sidebarOpen && <h2 className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">הקורסים שלי</h2>}
          <div className="space-y-1">
            {data?.courses?.map(course => {
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
            variant="ghost" 
            className={cn("w-full justify-start transition-colors", !sidebarOpen && "justify-center px-0", useStore.getState().pomodoro.active ? "text-primary bg-primary/10" : "text-muted-foreground")}
            onClick={() => useStore.getState().setShowPomodoroModal(true)}
            title="פומודורו"
          >
            <Clock className={cn("w-5 h-5", sidebarOpen && "ml-3")} />
            {sidebarOpen && <span>טיימר פומודורו</span>}
          </Button>

          <Button 
            variant={activeCategory === 'settings' ? 'secondary' : 'ghost'} 
            className={cn("w-full justify-start text-muted-foreground", !sidebarOpen && "justify-center px-0")}
            onClick={() => handleNavClick('settings')}
            title="הגדרות"
          >
            <Settings className={cn("w-5 h-5", sidebarOpen && "ml-3")} />
            {sidebarOpen && <span>הגדרות האתר</span>}
          </Button>
        </div>
      </aside>
    </>
  );
};
