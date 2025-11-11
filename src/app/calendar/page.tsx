
'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';

export default function CalendarPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="flex justify-center items-start">
      <Card className="p-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border-0"
        />
      </Card>
    </div>
  );
}
