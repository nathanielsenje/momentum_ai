'use client';

import * as React from 'react';
import { useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Task, WorkdayTask } from '@/lib/types';
import { useUser, useFirestore } from '@/firebase';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { getAllAvailableTasks, addWorkdayTask, getRecurringTasks } from '@/lib/data-firestore';
import { useToast } from '@/hooks/use-toast';
import { onClientWrite } from '@/app/actions';
import { format } from 'date-fns';
import { Zap, ZapOff, BatteryMedium, Folder, Repeat } from 'lucide-react';

export function AddTasksDialog({
  open,
  onOpenChange,
  workdayTasks,
  onTasksAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workdayTasks: WorkdayTask[];
  onTasksAdded: (tasks: WorkdayTask[]) => void;
}) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { tasks: regularTasks, categories, projects } = useDashboardData();
  const [selectedTaskIds, setSelectedTaskIds] = React.useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [allTasks, setAllTasks] = React.useState<Array<Task & { source: 'regular' | 'recurring' }>>([]);
  const { toast } = useToast();

  const today = format(new Date(), 'yyyy-MM-dd');

  // Load all available tasks (regular + recurring)
  React.useEffect(() => {
    if (!firestore || !user || !open) return;

    const loadTasks = async () => {
      try {
        const tasks = await getAllAvailableTasks(firestore, user.uid);
        setAllTasks(tasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };

    loadTasks();
  }, [firestore, user, open]);

  // Filter out tasks already in workday
  const workdayTaskIds = new Set(workdayTasks.map(wt => wt.taskId));
  const availableTasks = allTasks.filter(t => !workdayTaskIds.has(t.id) && !t.completed);

  const regularAvailableTasks = availableTasks.filter(t => t.source === 'regular');
  const recurringAvailableTasks = availableTasks.filter(t => t.source === 'recurring');

  const handleToggleTask = (taskId: string) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleAddTasks = () => {
    if (selectedTaskIds.size === 0) return;

    startTransition(async () => {
      try {
        const newWorkdayTasks: WorkdayTask[] = [];

        for (const taskId of selectedTaskIds) {
          const task = allTasks.find(t => t.id === taskId);
          if (task) {
            const workdayTask = await addWorkdayTask(
              firestore,
              user!.uid,
              taskId,
              task.source === 'recurring' ? 'recurring' : 'regular',
              today
            );
            newWorkdayTasks.push(workdayTask);
          }
        }

        onTasksAdded(newWorkdayTasks);
        setSelectedTaskIds(new Set());
        onOpenChange(false);
        toast({
          title: 'Tasks added!',
          description: `${newWorkdayTasks.length} task(s) added to today's workday.`,
        });
        await onClientWrite();
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'There was a problem adding tasks to your workday.',
        });
      }
    });
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name ?? categoryId;
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name;
  };

  const energyIcons = {
    Low: ZapOff,
    Medium: BatteryMedium,
    High: Zap,
  };

  const renderTaskItem = (task: Task & { source: 'regular' | 'recurring' }) => {
    const Icon = energyIcons[task.energyLevel];
    const isSelected = selectedTaskIds.has(task.id);
    const projectName = task.projectId ? getProjectName(task.projectId) : null;

    return (
      <div
        key={task.id}
        className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
        onClick={() => handleToggleTask(task.id)}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => handleToggleTask(task.id)}
          className="mt-1"
        />
        <div className="flex-grow min-w-0">
          <div className="font-medium text-sm">{task.name}</div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1">
            <Badge variant="secondary" className="text-xs">
              {getCategoryName(task.category)}
            </Badge>
            <div className="flex items-center gap-1">
              <Icon className="size-3" />
              <span>{task.energyLevel}</span>
            </div>
            {projectName && (
              <div className="flex items-center gap-1 truncate">
                <Folder className="size-3" />
                <span className="truncate">{projectName}</span>
              </div>
            )}
            {task.source === 'recurring' && (
              <div className="flex items-center gap-1 text-purple-500">
                <Repeat className="size-3" />
                <span>Recurring</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Tasks to Today's Workday</DialogTitle>
          <DialogDescription>
            Select tasks to add to your workday for {format(new Date(), 'EEEE, MMMM d')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="regular" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="regular">
              Regular Tasks ({regularAvailableTasks.length})
            </TabsTrigger>
            <TabsTrigger value="recurring">
              Recurring Tasks ({recurringAvailableTasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="regular" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {regularAvailableTasks.length > 0 ? (
                <div className="space-y-2">
                  {regularAvailableTasks.map(renderTaskItem)}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground py-12">
                  <p>No regular tasks available</p>
                  <p className="mt-1">All tasks are already in your workday or completed</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recurring" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {recurringAvailableTasks.length > 0 ? (
                <div className="space-y-2">
                  {recurringAvailableTasks.map(renderTaskItem)}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground py-12">
                  <p>No recurring tasks available</p>
                  <p className="mt-1">Create recurring tasks from the Recurring Tasks page</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedTaskIds.size} task(s) selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddTasks}
              disabled={selectedTaskIds.size === 0 || isPending}
            >
              Add {selectedTaskIds.size > 0 && `(${selectedTaskIds.size})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
