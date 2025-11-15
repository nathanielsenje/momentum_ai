'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clipboard, Download, FileText } from 'lucide-react';
import type { DailyReport } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { getReports } from '@/lib/data-firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { DateCard } from '@/components/reports/date-card';
import { VisualReportCard } from '@/components/reports/visual-report-card';

export function ReportsClientPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { loading: dataLoading } = useDashboardData();

  const [reports, setReports] = React.useState<DailyReport[]>([]);
  const [isFetching, setIsFetching] = React.useState(true);
  const [selectedReport, setSelectedReport] = React.useState<DailyReport | null>(null);
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
  
  if (userLoading || dataLoading || isFetching || !user) {
    return (
         <div className="space-y-6">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <CardTitle>Reports History</CardTitle>
            <CardDescription>Select a day to view its report.</CardDescription>
        </CardHeader>
        <CardContent>
            {reports.length > 0 ? (
                <Carousel opts={{ align: "start", dragFree: true }}>
                    <CarouselContent className="-ml-2">
                        {reports.map((report, index) => (
                            <CarouselItem key={index} className="basis-auto pl-2 flex flex-col">
                                <DateCard
                                    report={report}
                                    isSelected={selectedReport?.date === report.date}
                                    onSelect={() => setSelectedReport(report)}
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2" />
                    <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2" />
                </Carousel>
            ) : (
                 <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 bg-muted rounded-lg">
                    <FileText className="size-12 mb-4"/>
                    <h3 className="font-semibold text-lg text-foreground">No reports generated yet</h3>
                    <p>Complete tasks and use the daily report card to create your first report.</p>
                </div>
            )}
        </CardContent>
      </Card>

      {selectedReport ? (
        <VisualReportCard report={selectedReport} />
      ) : (
        !isFetching && reports.length > 0 && (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 bg-muted rounded-lg">
                <FileText className="size-16 mb-4"/>
                <h3 className="font-semibold text-lg text-foreground">Select a report</h3>
                <p>Choose a day from the history list above to see its details.</p>
              </div>
        )
      )}
    </div>
  );
}
