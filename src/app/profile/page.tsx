
'use client';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileClientPage } from './client-page';

export default function ProfilePage() {
  return (
    <React.Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-40 w-full max-w-lg" />
        </div>
      }
    >
      <ProfileClientPage />
    </React.Suspense>
  );
}
