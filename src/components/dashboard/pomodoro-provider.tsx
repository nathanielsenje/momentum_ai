'use client';

import React, { createContext, useState, ReactNode } from 'react';
import { Task } from '@/lib/types';

interface PomodoroContextType {
  focusedTask: Task | null;
  setFocusedTask: (task: Task | null) => void;
}

export const PomodoroContext = createContext<PomodoroContextType>({
  focusedTask: null,
  setFocusedTask: () => {},
});

export const PomodoroProvider = ({ children }: { children: ReactNode }) => {
  const [focusedTask, setFocusedTask] = useState<Task | null>(null);

  return (
    <PomodoroContext.Provider value={{ focusedTask, setFocusedTask }}>
      {children}
    </PomodoroContext.Provider>
  );
};
