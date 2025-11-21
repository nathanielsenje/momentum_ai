'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';
import { useUser } from '@/firebase';

export function CalendarClientPage() {
  const { user } = useUser();
  const [events, setEvents] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    // In a real implementation, you would fetch calendar events here.
    // For now, we just simulate loading.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [user]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View your events and tasks in one place.</p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Google Calendar integration is under construction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 bg-muted/50 rounded-lg">
            <Calendar className="size-16 mb-4" />
            <h3 className="font-semibold text-lg text-foreground">Unified Calendar View</h3>
            <p className="max-w-md mx-auto mt-2">
              Soon you'll be able to connect your Google Calendar to see all your meetings and deadlines right here, alongside your Momentum AI tasks.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
