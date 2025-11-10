'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { Zap, ZapOff, BatteryMedium, Sparkles } from 'lucide-react';
import { setEnergyLevelAction } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { EnergyLevel, EnergyLog } from '@/lib/types';

const energyLevels: { level: EnergyLevel; icon: React.ElementType; description: string }[] = [
  { level: 'Low', icon: ZapOff, description: 'Lazy day? Gentle tasks only.' },
  { level: 'Medium', icon: BatteryMedium, description: 'Feeling steady. Time to be productive.' },
  { level: 'High', icon: Zap, description: 'Full power! Tackle the big stuff.' },
];

export function EnergyInput({ todayEnergy }: { todayEnergy?: EnergyLog }) {
  const [isPending, startTransition] = useTransition();

  const handleSetEnergy = (level: EnergyLevel) => {
    startTransition(() => {
      setEnergyLevelAction(level);
    });
  };
  
  if (todayEnergy) {
    const currentLevel = energyLevels.find(e => e.level === todayEnergy.level);
    return (
       <Card className="bg-secondary border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary"/>
            Today's Vibe
          </CardTitle>
           <CardDescription>You're feeling {todayEnergy.level.toLowerCase()} today.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-background">
             {currentLevel?.icon && <currentLevel.icon className="size-8 text-primary" />}
            <div>
              <p className="font-semibold">{currentLevel?.level}</p>
              <p className="text-sm text-muted-foreground">{currentLevel?.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you feeling?</CardTitle>
        <CardDescription>Select your energy level to get task suggestions.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {energyLevels.map(({ level, icon: Icon }) => (
          <Button
            key={level}
            variant="outline"
            className="h-auto p-4 flex flex-col gap-2 items-center justify-center text-center"
            onClick={() => handleSetEnergy(level)}
            disabled={isPending}
            aria-label={`Set energy to ${level}`}
          >
            <Icon className="w-8 h-8 text-primary" />
            <span className="font-semibold">{level}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
