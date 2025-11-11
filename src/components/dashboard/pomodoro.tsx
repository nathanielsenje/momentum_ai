'use client';

import * as React from 'react';
import { Play, Pause, RotateCcw, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PomodoroContext } from './pomodoro-provider';

export function Pomodoro() {
  const { focusedTask } = React.useContext(PomodoroContext);
  const [minutes, setMinutes] = React.useState(25);
  const [seconds, setSeconds] = React.useState(0);
  const [isActive, setIsActive] = React.useState(false);
  const [sessionType, setSessionType] = React.useState<'Focus' | 'Break'>('Focus');

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds((s) => s - 1);
        } else if (minutes > 0) {
          setMinutes((m) => m - 1);
          setSeconds(59);
        } else {
          // Timer finished
          setIsActive(false);
          if (sessionType === 'Focus') {
            setSessionType('Break');
            setMinutes(5);
          } else {
            setSessionType('Focus');
            setMinutes(25);
          }
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, minutes, sessionType]);

  const toggle = () => {
    if (!focusedTask) return;
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setSessionType('Focus');
    setMinutes(25);
    setSeconds(0);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Pomodoro Timer</CardTitle>
        <CardDescription className="min-h-[1.25rem] text-xs sm:text-sm">
            {focusedTask ? (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Target className="size-3 flex-shrink-0" />
                    <span className="truncate">Focusing on: {focusedTask.name}</span>
                </span>
            ) : "Select a task to focus on."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow items-center justify-center gap-4 sm:gap-6">
        <div className="text-center">
            <p className="text-muted-foreground text-xs sm:text-sm mb-2">{sessionType} Session</p>
            <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold font-mono text-primary">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={toggle} size="lg" variant={isActive ? 'secondary' : 'default'} disabled={!focusedTask} className="flex-1 sm:flex-none">
            {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={reset} size="lg" variant="outline" disabled={!focusedTask} className="flex-1 sm:flex-none">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
