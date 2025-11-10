'use client';

import * as React from 'react';
import { useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { isThisWeek, isThisMonth, parseISO, format } from 'date-fns';
import { AddRecurringTaskDialog } from '@/components/recurring/add-recurring-task-dialog';
import { completeRecurringTaskAction } from '@/app/actions';
import type { RecurringTask } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface RecurringTasksClientPageProps {
  tasks: RecurringTask[];
}

export function RecurringTasksClientPage({ tasks: initialTasks }: RecurringTasksClientPageProps) {
  const [tasks, setTasks] = React.useState(initialTasks);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleCompleteTask = (taskId: string) => {
    startTransition(async () => {
        try {
            // Optimistic update
            setTasks(currentTasks => currentTasks.map(task => 
                task.id === taskId ? { ...task, lastCompleted: new Date().toISOString() } : task
            ));
            await completeRecurringTaskAction(taskId);
            toast({ title: 'Task marked as complete!' });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: 'There was a problem completing the task.',
            });
            // Revert optimistic update
            setTasks(initialTasks);
        }
    });
  }

  const weeklyTasks = tasks.filter(t => t.frequency === 'Weekly');
  const monthlyTasks = tasks.filter(t => t.frequency === 'Monthly');

  const renderTaskTable = (taskArray: RecurringTask[], period: 'Weekly' | 'Monthly') => {
    const checkCompletion = (lastCompleted: string | null) => {
        if (!lastCompleted) return false;
        const date = parseISO(lastCompleted);
        return period === 'Weekly' ? isThisWeek(date, { weekStartsOn: 1 }) : isThisMonth(date);
    };

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Completed</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {taskArray.map(task => {
            const isCompleted = checkCompletion(task.lastCompleted);
            return (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.name}</TableCell>
                <TableCell>
                  {isCompleted ? (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                      <Check className="mr-1 h-3 w-3" />
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <X className="mr-1 h-3 w-3" />
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {task.lastCompleted ? format(parseISO(task.lastCompleted), 'MMM d, yyyy') : 'Never'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => handleCompleteTask(task.id)}
                    disabled={isCompleted || isPending}
                  >
                    Mark Completed
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
            <CardTitle>Recurring Tasks</CardTitle>
            <CardDescription>Manage your weekly and monthly tasks.</CardDescription>
        </div>
        <AddRecurringTaskDialog />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly">
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly">
            {weeklyTasks.length > 0 ? (
                renderTaskTable(weeklyTasks, 'Weekly')
            ) : (
                <div className="text-center text-muted-foreground p-8">No weekly tasks yet.</div>
            )}
          </TabsContent>
          <TabsContent value="monthly">
            {monthlyTasks.length > 0 ? (
                renderTaskTable(monthlyTasks, 'Monthly')
            ) : (
                <div className="text-center text-muted-foreground p-8">No monthly tasks yet.</div>
            )}
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
