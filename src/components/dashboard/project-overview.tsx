'use client';

import * as React from 'react';
import Link from 'next/link';
import { Folder, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Project, Task } from '@/lib/types';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ProjectDialog } from './project-dialog';
import { cn, getProjectProgress } from '@/lib/utils';
import { useDashboardData } from '@/hooks/use-dashboard-data';

export function ProjectOverview() {
  const { projects, tasks } = useDashboardData();
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);

  const getProjectTasks = (projectId: string) => {
    return tasks.filter(t => t.projectId === projectId);
  };

  return (
    <>
      <Card>
          <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Folder className="text-primary size-5"/>
                      Projects Overview
                  </CardTitle>
                  <Button asChild variant="ghost" size="sm" className="self-start sm:self-auto">
                      <Link href="/projects">
                          View All
                          <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                  </Button>
              </div>
          </CardHeader>
          <CardContent>
              {projects.length > 0 ? (
                <Carousel
                  opts={{
                    align: "start",
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2 sm:-ml-4">
                    {projects.map(project => {
                        const progress = getProjectProgress(project.id, tasks);
                        return (
                           <CarouselItem key={project.id} className="pl-2 sm:pl-4 basis-[85%] sm:basis-1/2 md:basis-1/2 lg:basis-1/3 flex flex-col">
                             <div className="p-1 flex-1 flex flex-col">
                                <Card
                                  className="bg-secondary/30 cursor-pointer hover:border-primary/50 transition-colors flex-1 flex flex-col"
                                  onClick={() => setSelectedProject(project)}
                                >
                                    <CardHeader className="pb-2 px-4 pt-4">
                                        <CardTitle className="text-sm sm:text-base font-semibold line-clamp-2">{project.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center justify-center gap-2 flex-1 px-4 pb-4">
                                        <div className="flex items-center justify-between w-full gap-2">
                                            <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{progress.text} done</p>
                                            <ChartContainer
                                                config={{
                                                    value: { label: "Progress", color: "hsl(var(--primary))" }
                                                }}
                                                className="aspect-square h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0"
                                            >
                                                <RadialBarChart
                                                    data={progress.data}
                                                    startAngle={90}
                                                    endAngle={-270}
                                                    innerRadius="70%"
                                                    outerRadius="100%"
                                                    barSize={5}
                                                    cy="55%"
                                                >
                                                    <PolarAngleAxis type="number" domain={[0, 100]} dataKey="value" tick={false} />
                                                    <RadialBar dataKey="value" background cornerRadius={10} className="fill-primary" />
                                                    <text
                                                        x="50%"
                                                        y="55%"
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        className="fill-foreground text-xs font-medium"
                                                    >
                                                        {progress.percentage}%
                                                    </text>
                                                </RadialBarChart>
                                            </ChartContainer>
                                        </div>
                                         {progress.totalTasks > 0 && (
                                            <div className="flex w-full gap-1 pt-1">
                                                {Array.from({ length: Math.min(progress.totalTasks, 10) }).map((_, i) => (
                                                    <div key={i} className="h-1 flex-1 rounded-full bg-muted">
                                                        <div className={cn(
                                                            "h-1 rounded-full",
                                                            i < progress.completedTasks && "bg-primary"
                                                        )} />
                                                    </div>
                                                ))}
                                                {progress.totalTasks > 10 && (
                                                  <span className="text-[10px] text-muted-foreground ml-1">+{progress.totalTasks - 10}</span>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                           </CarouselItem>
                        )
                    })}
                  </CarouselContent>
                   <div className="flex justify-center items-center gap-2 mt-4">
                    <CarouselPrevious className="static translate-y-0 h-8 w-8" />
                    <CarouselNext className="static translate-y-0 h-8 w-8" />
                  </div>
                </Carousel>
              ) : (
                  <div className="col-span-full text-center text-muted-foreground py-8">
                      <p className="text-sm">No projects yet. Create one on the projects page!</p>
                  </div>
              )}
          </CardContent>
      </Card>
      {selectedProject && (
        <ProjectDialog
          project={selectedProject}
          tasks={getProjectTasks(selectedProject.id)}
          open={!!selectedProject}
          onOpenChange={(isOpen) => !isOpen && setSelectedProject(null)}
        />
      )}
    </>
  );
}
