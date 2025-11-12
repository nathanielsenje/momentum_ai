'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BrainCircuit, FileText, Loader2, ServerCrash } from 'lucide-react';
import { useUser } from '@/firebase';
import { Skeleton } from '../ui/skeleton';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { visualizeFlowAlignment } from '@/ai/flows/visualize-flow-alignment';

interface ReportData {
  report: string;
}

export function AiInsightsCard() {
  const { user } = useUser();
  const { tasks, energyLog, loading: dataLoading } = useDashboardData();
  const [reportData, setReportData] = React.useState<ReportData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isGenerating, startTransition] = React.useTransition();
  const { toast } = useToast();

  const handleGenerateReport = () => {
    if (!user) return;
    startTransition(async () => {
      setError(null);
      setReportData(null);
      try {
        const result = await visualizeFlowAlignment({ tasks, energyLog });
        if (result.report) {
            setReportData(result);
             toast({
              title: 'AI Insight Generated!',
              description: "Here's a fresh look at your productivity.",
            });
        } else {
            throw new Error("The AI didn't return the expected data.");
        }
      } catch (err: any) {
        console.error("Flow alignment error:", err);
        setError(err.message || 'An unknown error occurred.');
        toast({
          variant: 'destructive',
          title: 'Failed to generate report',
          description: err.message || 'Please try again later.',
        });
      }
    });
  };

  if (dataLoading) {
      return <Skeleton className="h-48 w-full" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="text-primary"/>
            AI Insights
        </CardTitle>
        <CardDescription>
          Generate an AI-powered analysis of your task and energy alignment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!reportData && !isGenerating && (
             <Button onClick={handleGenerateReport} disabled={isGenerating}>
                {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <FileText className="mr-2 h-4 w-4" />
                )}
                {isGenerating ? 'Analyzing...' : 'Generate New Insight'}
            </Button>
        )}
       
        {isGenerating && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <ServerCrash className="h-4 w-4" />
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {reportData && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reportData.report}</p>
            </div>
            <Button onClick={handleGenerateReport} disabled={isGenerating} variant="outline">
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? 'Analyzing...' : 'Generate Another'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
