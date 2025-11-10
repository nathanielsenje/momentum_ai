import { Lightbulb, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { EnergyLevel } from '@/lib/types';

interface SuggestedTasksProps {
  suggestedTasks: string[];
  energyLevel?: EnergyLevel;
}

export function SuggestedTasks({ suggestedTasks, energyLevel }: SuggestedTasksProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Lightbulb className="text-accent"/>
            Suggested for you
        </CardTitle>
        <CardDescription>
            {energyLevel 
                ? `AI-powered suggestions for your ${energyLevel.toLowerCase()} energy level.`
                : 'Set your energy level to get suggestions.'
            }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {suggestedTasks.length > 0 ? (
          <ul className="space-y-3">
            {suggestedTasks.map((task, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
                <span className="text-sm">{task}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-sm text-muted-foreground py-8">
            <p>{energyLevel ? 'No specific tasks to suggest right now.' : 'Waiting for your energy input...'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
