'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Calendar } from 'lucide-react';

export function SettingsClientPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = React.useState(false);

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleConnectCalendar = async () => {
    setIsConnecting(true);
    try {
        const response = await fetch('/api/auth/google');
        if (response.ok) {
            const { authUrl } = await response.json();
            // Redirect the user to Google's OAuth consent screen
            window.location.href = authUrl;
        } else {
            throw new Error('Failed to get authorization URL.');
        }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Connection Failed',
            description: 'Could not initiate connection to Google Calendar. Please try again.',
        });
        setIsConnecting(false);
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and integrations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Connect Momentum AI with other services.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <Calendar className="size-6 text-primary" />
              <div>
                <h3 className="font-semibold">Google Calendar</h3>
                <p className="text-sm text-muted-foreground">Not connected</p>
              </div>
            </div>
            <Button onClick={handleConnectCalendar} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
