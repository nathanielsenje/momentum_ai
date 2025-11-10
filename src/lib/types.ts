export type EnergyLevel = 'Low' | 'Medium' | 'High';
export type FocusType = 'Creative' | 'Analytical' | 'Physical' | 'Administrative';
export type ProjectPriority = 'Low' | 'Medium' | 'High';
export type EisenhowerMatrix = 'Urgent & Important' | 'Important & Not Urgent' | 'Urgent & Not Important' | 'Not Urgent & Not Important';

export interface Task {
  id: string;
  name: string;
  category: string;
  energyLevel: EnergyLevel;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  projectId?: string;
  deadline?: string;
  effort?: number; // 1-3 scale
  focusType?: FocusType;
  score?: number; // AI-generated score
  priority?: EisenhowerMatrix;
}

export interface Category {
  id: string;
  name: string;
}

export interface EnergyLog {
  date: string; // YYYY-MM-DD
  level: EnergyLevel;
}

export interface MomentumScore {
  date: string; // YYYY-MM-DD
  score: number;
  streak: number;
  summary: string;
}

export interface Project {
    id: string;
    name: string;
    priority: ProjectPriority;
}
