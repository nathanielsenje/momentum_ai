'use client';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileClientPage } from './client-page';

export default function ProfilePage() {
  return (
    <React.Suspense
      fallback={
        <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
            <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
      }
    >
      <ProfileClientPage />
    </React.Suspense>
  );
}
