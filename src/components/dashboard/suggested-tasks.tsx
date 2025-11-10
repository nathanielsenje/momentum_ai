import { Lightbulb, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { EnergyLevel, Task } from '@/lib/types';
import { Badge } from '../ui/badge';

interface SuggestedTasksProps {
  suggestedTasks: Task[];
  energyLevel?: EnergyLevel;
}

export function SuggestedTasks({ suggestedTasks, energyLevel }: SuggestedTasksProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="text-accent"/>
            Suggested for you
        </CardTitle>
        <CardDescription>
            {energyLevel 
                ? `AI suggestions for your ${energyLevel.toLowerCase()} energy.`
                : 'Set energy to get suggestions.'
            }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {suggestedTasks.length > 0 ? (
          <ul className="space-y-3">
            {suggestedTasks.map((task, index) => (
              <li key={index} className="flex items-start gap-3 p-2 rounded-md bg-secondary/30">
                <CheckCircle className="mt-1 size-4 shrink-0 text-primary" />
                <div className='flex-1'>
                    <p className="text-sm font-medium">{task.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Badge variant={task.energyLevel === energyLevel ? "default" : "secondary"}>
                            {task.energyLevel} Energy
                        </Badge>
                         {task.deadline && (
                            <Badge variant="outline">
                                Due: {new Date(task.deadline).toLocaleDateString()}
                            </Badge>
                        )}
                    </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-sm text-muted-foreground py-8">
            <p>{energyLevel ? 'No specific tasks to suggest.' : 'Waiting for energy input...'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
