
'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clipboard, Download, FileText, Loader2, Calendar, CheckCircle } from 'lucide-react';
import type { DailyReport } from '@/lib/types';
import { format, parseISO, isToday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { getReports, getTasks, updateTodaysReport } from '@/lib/data-firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { generateReportAction } from '../actions';
import { MarkdownPreview } from '@/components/markdown-preview';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';


export function ReportsClientPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { loading: dataLoading } = useDashboardData();

  const [reports, setReports] = React.useState<DailyReport[]>([]);
  const [isFetching, setIsFetching] = React.useState(true);
  const [selectedReport, setSelectedReport] = React.useState<DailyReport | null>(null);
  const [clientFormattedTimes, setClientFormattedTimes] = React.useState({ startTime: 'N/A', endTime: 'N/A' });
  const [isGenerating, startGeneratingTransition] = useTransition();
  const { toast } = useToast();

  const fetchReports = React.useCallback(async () => {
    if (user && firestore) {
      setIsFetching(true);
      try {
        const reportsData = await getReports(firestore, user.uid);
        const reportsArray = Object.values(reportsData).sort((a, b) => b.date.localeCompare(a.date));
        setReports(reportsArray);
        if (!selectedReport && reportsArray.length > 0) {
          setSelectedReport(reportsArray[0]);
        } else if (selectedReport) {
          const updatedSelected = reportsArray.find(r => r.date === selectedReport.date);
          setSelectedReport(updatedSelected || reportsArray[0] || null);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast({ variant: 'destructive', title: 'Could not load reports.' });
      } finally {
        setIsFetching(false);
      }
    }
  }, [user, firestore, selectedReport, toast]);

  React.useEffect(() => {
    fetchReports();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, firestore]);

  React.useEffect(() => {
    if (selectedReport) {
      setClientFormattedTimes({
        startTime: selectedReport.startTime ? format(parseISO(selectedReport.startTime), 'p') : 'N/A',
        endTime: selectedReport.endTime ? format(parseISO(selectedReport.endTime), 'p') : 'N/A',
      });
    }
  }, [selectedReport]);


  const handleCopyToClipboard = (text: string | null) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast({ title: 'Report copied to clipboard!' });
    }
  };

  const handleExport = (report: DailyReport | null) => {
    if (!report || !report.generatedReport) return;
    const blob = new Blob([report.generatedReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily_report_${report.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Report exported as .txt!' });
  };

  const handleGenerateReport = () => {
    if (!selectedReport || !user || !firestore) return;

    startGeneratingTransition(async () => {
      try {
        const allTasks = await getTasks(firestore, user.uid);
        
        const generatedText = await generateReportAction({ userId: user.uid, report: selectedReport, tasks: allTasks });
        
        if (generatedText) {
          await updateTodaysReport(firestore, user.uid, { generatedReport: generatedText });
          await fetchReports(); // Refetch all reports to get the updated one
          toast({ title: "AI summary generated!" });
        } else {
            throw new Error("Generated report text was empty.");
        }
      } catch (error) {
        console.error("Failed to generate report:", error);
        toast({ variant: 'destructive', title: 'Could not generate AI summary.' });
      }
    });
  };
  
  if (userLoading || dataLoading || isFetching || !user) {
    return (
         <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
                <Skeleton className="h-[calc(100vh-10rem)] w-full" />
            </div>
            <div className="lg:col-span-2">
                <Skeleton className="h-[calc(100vh-10rem)] w-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Reports History</CardTitle>
            <CardDescription>Select a day to view its report.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-15rem)]">
              <div className="flex flex-col gap-2 pr-4">
                {reports.map(report => {
                    const completionRate = report.goals > 0 ? (report.completed / report.goals) * 100 : 0;
                    const isSelected = selectedReport?.date === report.date;

                    return (
                        <button
                            key={report.date}
                            onClick={() => setSelectedReport(report)}
                            className={cn(
                                "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                                isSelected && "bg-accent shadow-inner"
                            )}
                        >
                            <div className="flex w-full flex-col gap-1">
                                <div className="flex items-center">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <div className="font-semibold">{format(parseISO(report.date), 'MMM d, yyyy')}</div>
                                    </div>
                                    {isToday(parseISO(report.date)) && (
                                        <div className="ml-auto text-xs">
                                            <Badge>Today</Badge>
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {format(parseISO(report.date), 'eeee')}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3"/>
                                    {report.completed} / {report.goals} done
                                </div>
                            </div>
                             <div className="w-full bg-secondary rounded-full h-1.5">
                                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${completionRate}%` }}></div>
                            </div>
                        </button>
                    )
                })}
              </div>
            </ScrollArea>
          </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader>
            {selectedReport ? (
              <>
                <CardTitle>
                  {`Report for ${format(parseISO(selectedReport.date), 'eeee, MMMM d')}`}
                </CardTitle>
                <CardDescription>
                    {`Started: ${clientFormattedTimes.startTime} | Ended: ${clientFormattedTimes.endTime}`}
                </CardDescription>
              </>
            ) : (
                <CardTitle>No Report Selected</CardTitle>
            )}
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-4">
            {selectedReport ? (
              <>
                 <ScrollArea className="flex-grow h-[calc(100vh-25rem)] w-full rounded-md border bg-background/50 p-4">
                     <MarkdownPreview content={selectedReport.generatedReport}/>
                 </ScrollArea>
                 <div className="flex flex-wrap gap-2">
                    <Button onClick={handleGenerateReport} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                        {isGenerating ? 'Generating...' : 'Generate AI Summary'}
                    </Button>
                    <Button variant="secondary" onClick={() => handleCopyToClipboard(selectedReport.generatedReport)}><Clipboard className="mr-2 h-4 w-4" />Copy</Button>
                    <Button variant="outline" onClick={() => handleExport(selectedReport)}><Download className="mr-2 h-4 w-4" />Export .txt</Button>
                 </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 bg-muted rounded-lg">
                <FileText className="size-16 mb-4"/>
                <h3 className="font-semibold text-lg text-foreground">Select a report</h3>
                <p>Choose a day from the history list to see its details and generate an AI summary.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
