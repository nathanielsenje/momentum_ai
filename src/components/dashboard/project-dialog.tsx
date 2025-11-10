'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { Project, Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Folder } from 'lucide-react';

interface ProjectDialogProps {
  project: Project;
  tasks: Task[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDialog({ project, tasks, open, onOpenChange }: ProjectDialogProps) {
  const completedTasks = tasks.filter(t => t.completed);
  const openTasks = tasks.filter(t => !t.completed);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="text-primary" />
            {project.name}
          </DialogTitle>
          <DialogDescription>
            {completedTasks.length} of {tasks.length} tasks completed.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72">
          <div className="space-y-4 pr-4">
            {openTasks.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Open Tasks</h3>
                <div className="space-y-2">
                  {openTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-2 rounded-md bg-secondary/50">
                      <Checkbox id={`task-${task.id}`} checked={false} disabled />
                      <label htmlFor={`task-${task.id}`} className="text-sm font-medium">{task.name}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {completedTasks.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Completed Tasks</h3>
                <div className="space-y-2">
                  {completedTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-2 rounded-md bg-secondary/50">
                      <Checkbox id={`task-${task.id}`} checked={true} disabled />
                       <label
                        htmlFor={`task-${task.id}`}
                        className="text-sm font-medium text-muted-foreground line-through"
                      >
                        {task.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tasks.length === 0 && (
                <div className="text-center text-muted-foreground pt-10">
                    <p>No tasks in this project yet.</p>
                </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
