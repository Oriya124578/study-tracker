import React from 'react';
import { useStore } from '../../store/useStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { useTranslation } from '../../hooks/useTranslation';

export const MobileCourseMenu = () => {
  const { data, activeCategory, setActiveCategory, setActiveCourse } = useStore();
  const { t, language } = useTranslation();

  const isOpen = activeCategory === 'courses';

  const handleSelect = (course) => {
    setActiveCourse(course);
    setActiveCategory('course');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && setActiveCategory('overview')}>
      <DialogContent dir={language === 'he' ? 'rtl' : 'ltr'} className="sm:max-w-md w-[90vw] mx-auto rounded-t-2xl md:rounded-xl mb-0 mt-auto md:mt-auto md:mb-auto self-end md:self-center">
        <DialogHeader>
          <DialogTitle className={language === 'he' ? 'text-right' : 'text-left'}>{t('selectCourse')}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-2 mt-4 pb-8 md:pb-0">
          {data?.courses?.map(course => (
            <Button 
              key={course.id} 
              variant="outline" 
              className="justify-start h-12 text-base"
              onClick={() => handleSelect(course)}
            >
              {course.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
