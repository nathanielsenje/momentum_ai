import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Project, Task } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getProjectProgress = (projectId: string, tasks: Task[]) => {
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  const totalTasks = projectTasks.length;
  if (totalTasks === 0) {
    return { percentage: 0, text: "No tasks", data: [], totalTasks: 0, completedTasks: 0 };
  }
  
  const completedTasks = projectTasks.filter(t => t.completed).length;
  const percentage = Math.round((completedTasks / totalTasks) * 100);
  
  return {
    percentage,
    text: `${completedTasks} / ${totalTasks}`,
    data: [{ name: 'Progress', value: percentage, fill: "hsl(var(--primary))" }],
    totalTasks,
    completedTasks
  };
};
