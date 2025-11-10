'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Palette, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2">
            <Palette />
            <span>Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Focus Blue
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('theme-flow-neon')}>
          Flow Neon
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('theme-earth-tone')}>
          Earth Tone
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
