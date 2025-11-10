'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start gap-2"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
        {theme === 'light' ? <Moon /> : <Sun />}
        <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
    </Button>
  );
}
