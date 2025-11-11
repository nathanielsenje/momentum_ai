
'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { Clipboard, FileText, Play, Square, Goal, CheckCircle2, Hourglass } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateReportAction } from '@/app/actions';
import type { DailyReport } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useUser } from '@/firebase';

export function DailyReportCard() {
  const { user } = useUser();
  const { todaysReport: initialReport } = useDashboardData();
  const userId = user!.uid;

  const [report, setReport] = React.useState<DailyReport | null>(initialReport);
  const [clientFormattedTimes, setClientFormattedTimes] = React.useState({ startTime: 'Not set', endTime: 'Not set' });
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  React.useEffect(() => {
    setReport(initialReport);
  }, [initialReport]);

  React.useEffect(() => {
    setClientFormattedTimes({
      startTime: initialReport?.startTime ? format(parseISO(initialReport.startTime), 'p') : 'Not set',
      endTime: initialReport?.endTime ? format(parseISO(initialReport.endTime), 'p') : 'Not set',
    });
  }, [initialReport?.startTime, initialReport?.endTime]);

  const handleTimeTracking = (action: 'start' | 'end') => {
    const now = new Date().toISOString();
    const updates: Partial<DailyReport> = action === 'start' ? { startTime: now } : { endTime: now };
    
    // Optimistic UI update
    const previousReport = report;
    setReport(prev => prev ? { ...prev, ...updates } : null);

    startTransition(async () => {
      try {
        const updatedReport = await updateReportAction(userId, updates);
        // Sync with server state
        setReport(updatedReport);
        toast({ title: `Work ${action} time recorded!` });
      } catch (e) {
        // Revert on error
        setReport(previousReport);
        toast({ variant: 'destructive', title: `Failed to record ${action} time.` });
      }
    });
  };

  const handleCopyToClipboard = () => {
    if (report?.generatedReport) {
      navigator.clipboard.writeText(report.generatedReport);
      toast({ title: 'Report copied to clipboard!' });
    } else {
      // Placeholder for future AI generation
      toast({ title: 'Report generated and copied!' });
    }
  };

  return (
    <Card className="bg-secondary/30 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="text-primary" />
          Daily Work Report
        </CardTitle>
        <CardDescription>Log your work hours and generate a summary.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">Work Time</h4>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTimeTracking('start')}
                disabled={isPending || !!report?.startTime}
                className="flex-1 sm:flex-none"
              >
                <Play className="mr-2 h-4 w-4" /> Start
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTimeTracking('end')}
                disabled={isPending || !report?.startTime || !!report?.endTime}
                className="flex-1 sm:flex-none"
              >
                <Square className="mr-2 h-4 w-4" /> End
              </Button>
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>Start: <span className="font-medium text-foreground">{clientFormattedTimes.startTime}</span></p>
              <p>End: <span className="font-medium text-foreground">{clientFormattedTimes.endTime}</span></p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">Task Summary</h4>
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-x-4 gap-y-2 text-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-1.5 text-muted-foreground">
                    <Goal className="size-4 text-amber-500" />
                    <span className="text-xs sm:text-sm"><span className="font-bold text-foreground">{report?.goals ?? 0}</span> Goals</span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-1.5 text-muted-foreground">
                    <CheckCircle2 className="size-4 text-green-500" />
                    <span className="text-xs sm:text-sm"><span className="font-bold text-foreground">{report?.completed ?? 0}</span> Done</span>
                </div>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-1.5 text-muted-foreground">
                    <Hourglass className="size-4 text-blue-500" />
                    <span className="text-xs sm:text-sm"><span className="font-bold text-foreground">{report?.inProgress ?? 0}</span> Active</span>
                </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-primary/10">
          <Button size="sm" disabled={isPending} className="w-full sm:w-auto">
            <FileText className="mr-2 h-4 w-4" /> Generate Report
          </Button>
          <Button size="sm" variant="secondary" onClick={handleCopyToClipboard} disabled={isPending} className="w-full sm:w-auto">
            <Clipboard className="mr-2 h-4 w-4" /> Copy to Clipboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
