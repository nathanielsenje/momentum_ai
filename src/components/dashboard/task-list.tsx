'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { completeTaskAction } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddTaskDialog } from './add-task-dialog';
import type { Task, Category, EnergyLevel, EnergyLog } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Zap, ZapOff, BatteryMedium, Target, ListTodo } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const energyIcons: Record<EnergyLevel, React.ElementType> = {
  Low: ZapOff,
  Medium: BatteryMedium,
  High: Zap,
};

export function TaskList({ tasks, categories, todayEnergy }: { tasks: Task[]; categories: Category[], todayEnergy?: EnergyLog }) {
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = React.useState<EnergyLevel | 'all'>('all');

  const handleComplete = (id: string, completed: boolean) => {
    startTransition(() => {
      completeTaskAction(id, completed);
    });
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return !task.completed;
    return task.energyLevel === filter && !task.completed;
  });

  const completedTasks = tasks.filter(task => task.completed);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex-grow">
                <CardTitle className="flex items-center gap-2">
                    <ListTodo className="text-primary"/>
                    Your Tasks
                </CardTitle>
                <CardDescription>Manage your daily objectives.</CardDescription>
            </div>
             <div className="flex items-center gap-2">
                 <Select value={filter} onValueChange={(value) => setFilter(value as EnergyLevel | 'all')}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Filter by energy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Energy</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
                <AddTaskDialog categories={categories} />
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {filteredTasks.length > 0 ? (
                filteredTasks.map(task => {
                    const Icon = energyIcons[task.energyLevel];
                    const isAligned = todayEnergy?.level === task.energyLevel;
                    return (
                        <div key={task.id} className="flex items-start gap-4 p-3 rounded-lg bg-background hover:bg-secondary/50 transition-colors">
                            <Checkbox
                                id={`task-${task.id}`}
                                checked={task.completed}
                                onCheckedChange={(checked) => handleComplete(task.id, !!checked)}
                                disabled={isPending}
                                className="mt-1"
                            />
                            <div className="flex-grow">
                                <label htmlFor={`task-${task.id}`} className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>
                                    {task.name}
                                </label>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    <Badge variant="secondary" className="capitalize">{task.category}</Badge>
                                    <div className="flex items-center gap-1">
                                        <Icon className="size-3" />
                                        <span>{task.energyLevel} Energy</span>
                                    </div>
                                </div>
                                 {todayEnergy && !task.completed && (
                                     <div className={cn(
                                         "flex items-center gap-1.5 text-xs mt-1.5",
                                         isAligned ? "text-primary" : "text-amber-600"
                                     )}>
                                        <Target className="size-3"/>
                                        <span>{isAligned ? "Perfect for your current energy" : "Not aligned with today's vibe"}</span>
                                     </div>
                                 )}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="text-center text-sm text-muted-foreground py-8">
                    <p>All tasks for this filter are complete. Well done!</p>
                </div>
            )}
            {completedTasks.length > 0 && (
                <div className="pt-4">
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Completed</h3>
                    <div className="space-y-2">
                         {completedTasks.map(task => (
                             <div key={task.id} className="flex items-center gap-4">
                                <Checkbox
                                    id={`task-${task.id}`}
                                    checked={task.completed}
                                    onCheckedChange={(checked) => handleComplete(task.id, !!checked)}
                                    disabled={isPending}
                                    className="mt-1"
                                />
                                <label htmlFor={`task-${task.id}`} className="flex-grow text-muted-foreground line-through">
                                    {task.name}
                                </label>
                            </div>
                         ))}
                    </div>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
