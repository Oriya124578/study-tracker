import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { CheckCircle2, Circle, Link2, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const GLOBAL_CATEGORIES = [
  { id: 'past_exams', title: 'מבחני עבר' },
  { id: 'summaries', title: 'סיכומים' },
  { id: 'quizzes', title: 'בחנים' }
];

export const GlobalTasks = () => {
  const { activeCourse, data, toggleGlobalTask, saveLinks } = useStore();
  const [editingLinks, setEditingLinks] = useState(false);
  
  if (!activeCourse) return null;

  const globalTasks = data?.globalTasks[activeCourse.id];
  const links = data?.links[activeCourse.id];
  const [localLinks, setLocalLinks] = useState(links || { notebookLm: '', gemini: '', localFolder: '' });

  const handleSaveLinks = () => {
    saveLinks(activeCourse.id, localLinks);
    setEditingLinks(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" /> קישורים חשובים
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setEditingLinks(!editingLinks)}>
            {editingLinks ? 'ביטול' : 'עריכה'}
          </Button>
        </CardHeader>
        <CardContent>
          {editingLinks ? (
            <div className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">NotebookLM Link</label>
                <Input value={localLinks.notebookLm} onChange={e => setLocalLinks({...localLinks, notebookLm: e.target.value})} dir="ltr" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Gemini Link</label>
                <Input value={localLinks.gemini} onChange={e => setLocalLinks({...localLinks, gemini: e.target.value})} dir="ltr" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Local Folder (Path)</label>
                <Input value={localLinks.localFolder} onChange={e => setLocalLinks({...localLinks, localFolder: e.target.value})} dir="ltr" />
              </div>
              <Button onClick={handleSaveLinks} className="w-full mt-2">שמור קישורים</Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 mt-2">
              {links?.notebookLm && (
                <a href={links.notebookLm} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted rounded-lg transition-colors text-sm font-medium">
                  NotebookLM <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              )}
              {links?.gemini && (
                <a href={links.gemini} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted rounded-lg transition-colors text-sm font-medium">
                  Gemini <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              )}
              {links?.localFolder && (
                <span className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg text-sm font-medium border border-border/50">
                  <span className="text-muted-foreground">תיקייה:</span> {links.localFolder}
                </span>
              )}
              {!links?.notebookLm && !links?.gemini && !links?.localFolder && (
                <span className="text-sm text-muted-foreground">אין קישורים שמורים.</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {GLOBAL_CATEGORIES.map(category => {
          const tasks = globalTasks?.[category.id] || [];
          return (
            <Card key={category.id}>
              <CardHeader className="bg-muted/30 border-b border-border pb-4">
                <CardTitle className="text-lg">{category.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">אין פריטים תחת {category.title}.</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-muted/30 rounded-lg transition-colors">
                        <button 
                          className="text-primary hover:text-primary/80 transition-colors"
                          onClick={() => toggleGlobalTask(activeCourse.id, category.id, task.id)}
                        >
                          {task.checked ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>
                        <span className={cn("text-sm font-medium", task.checked && "line-through text-muted-foreground")}>
                          {task.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  );
};
