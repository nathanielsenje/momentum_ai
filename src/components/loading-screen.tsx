'use client';

import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
      <div className="relative">
        <Logo className="h-32 w-32 text-primary animate-glow" />
      </div>
    </div>
  );
}
