import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { CheckCircle2, Circle, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardContent } from '../ui/card';

export const WeeklyTasks = () => {
  const { activeCourse, data, toggleTask, reorderTasks, moveTaskBetweenWeeks, saveNote } = useStore();
  
  // Keep track of which weeks are expanded. Default all to true.
  const [expandedWeeks, setExpandedWeeks] = useState({});

  if (!activeCourse || !data?.tasks[activeCourse.id]) return null;

  const courseTasks = data.tasks[activeCourse.id];
  const courseNotes = data.notes[activeCourse.id];

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      if (source.index === destination.index) return;
      
      const week = parseInt(source.droppableId);
      const items = Array.from(courseTasks[week]);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      
      reorderTasks(activeCourse.id, week, items);
    } else {
      const sourceWeek = parseInt(source.droppableId);
      const destWeek = parseInt(destination.droppableId);
      
      moveTaskBetweenWeeks(
        activeCourse.id,
        sourceWeek,
        destWeek,
        result.draggableId,
        source.index,
        destination.index
      );
    }
  };

  const toggleWeek = (week) => {
    setExpandedWeeks(prev => ({ ...prev, [week]: prev[week] === false ? true : false }));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-6">
        {Object.entries(courseTasks).map(([weekNum, tasks]) => {
          const week = parseInt(weekNum);
          const isExpanded = expandedWeeks[week] !== false; // Default true
          const allDone = tasks.length > 0 && tasks.every(t => t.checked);
          
          return (
            <Card key={week} className={cn("transition-colors overflow-hidden", allDone && "bg-muted/30 border-primary/20")}>
              <div 
                className="p-4 flex items-center justify-between cursor-pointer select-none bg-background hover:bg-muted/20"
                onClick={() => toggleWeek(week)}
              >
                <div className="flex items-center gap-3">
                  <h3 className={cn("font-bold text-lg", allDone ? "text-primary" : "text-foreground")}>
                    שבוע {week}
                  </h3>
                  {allDone && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">הושלם</span>}
                </div>
                <div className="text-muted-foreground">
                  {isExpanded ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                </div>
              </div>

              {isExpanded && (
                <CardContent className="p-4 pt-0 border-t border-border/50">
                  <Droppable droppableId={weekNum}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={cn("space-y-2 mt-4 min-h-[50px] transition-colors rounded-lg p-1", snapshot.isDraggingOver && "bg-muted/50")}
                      >
                        {tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-lg border transition-all",
                                  snapshot.isDragging ? "bg-background shadow-lg border-primary/50 rotate-1 scale-105" : "bg-card border-border hover:border-border/80",
                                  task.checked && "opacity-75 bg-muted/20"
                                )}
                              >
                                <div {...provided.dragHandleProps} className="text-muted-foreground/50 hover:text-foreground cursor-grab">
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                
                                <button 
                                  className="text-primary hover:text-primary/80 transition-colors"
                                  onClick={() => toggleTask(activeCourse.id, week, task.id)}
                                >
                                  {task.checked ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                </button>
                                
                                <span className={cn("font-medium", task.checked && "line-through text-muted-foreground")}>
                                  {task.label}
                                </span>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <div className="mt-4">
                    <textarea
                      placeholder="הערות אישיות לשבוע זה... (ניתן לכתוב בולד באמצעות **טקסט**)"
                      className="w-full h-24 p-3 bg-muted/20 border border-border rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                      value={courseNotes?.[week] || ""}
                      onChange={(e) => saveNote(activeCourse.id, week, e.target.value)}
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </DragDropContext>
  );
};
