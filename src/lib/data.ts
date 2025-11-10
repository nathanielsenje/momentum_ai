'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Task, Category, EnergyLog, MomentumScore, EnergyLevel, Project, RecurringTask, DailyReport } from './types';
import { format } from 'date-fns';

const dataDir = path.join(process.cwd(), 'data');

// In-memory cache
const cache: { [key: string]: { data: any; timestamp: number } } = {};
const CACHE_DURATION = process.env.NODE_ENV === 'development' ? 1000 : 30000; // 1s in dev, 30s in prod

async function readData<T>(filename: string): Promise<T> {
  const now = Date.now();
  if (cache[filename] && (now - cache[filename].timestamp) < CACHE_DURATION) {
    return cache[filename].data as T;
  }

  const filePath = path.join(dataDir, filename);
  try {
    // Ensure directory exists
    await fs.mkdir(dataDir, { recursive: true });
    const data = await fs.readFile(filePath, 'utf-8');
    const parsedData = JSON.parse(data);
    cache[filename] = { data: parsedData, timestamp: now };
    return parsedData as T;
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      const defaultData = filename === 'reports.json' ? {} : [];
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      cache[filename] = { data: defaultData, timestamp: now };
      return defaultData as T;
    }
    console.error(`Error reading or creating ${filename}:`, error);
    throw error;
  }
}

async function writeData<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(dataDir, filename);
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  // Invalidate cache on write
  delete cache[filename];
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error;
}

const getToday = () => format(new Date(), 'yyyy-MM-dd');

// Task Functions
export async function getTasks(): Promise<Task[]> {
  return readData<Task[]>('tasks.json');
}

export async function addTask(taskData: Omit<Task, 'id' | 'completed' | 'completedAt' | 'createdAt'>): Promise<Task> {
  const tasks = await getTasks();
  const newTask: Task = {
    ...taskData,
    id: Date.now().toString(),
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
  };
  const updatedTasks = [...tasks, newTask];
  await writeData('tasks.json', updatedTasks);
  return newTask;
}

export async function updateTask(taskId: string, updates: Partial<Omit<Task, 'id'>>): Promise<Task | undefined> {
  const tasks = await getTasks();
  let updatedTask: Task | undefined;
  const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
          updatedTask = { ...t, ...updates };
          return updatedTask;
      }
      return t;
  });
  if (!updatedTask) return undefined;

  await writeData('tasks.json', updatedTasks);
  return updatedTask;
}

export async function deleteTask(taskId: string): Promise<void> {
    const tasks = await getTasks();
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    await writeData('tasks.json', updatedTasks);
}

// Category Functions
export async function getCategories(): Promise<Category[]> {
  return readData<Category[]>('categories.json');
}

// Energy Log Functions
export async function getEnergyLog(): Promise<EnergyLog[]> {
    return readData<EnergyLog[]>('energy-log.json');
}

export async function setTodayEnergy(level: EnergyLevel): Promise<EnergyLog> {
  const logs = await getEnergyLog();
  const today = getToday();
  
  const existingLogIndex = logs.findIndex(log => log.date === today);

  let newLog: EnergyLog;
  if (existingLogIndex > -1) {
    logs[existingLogIndex].level = level;
    newLog = logs[existingLogIndex];
  } else {
    newLog = { date: today, level };
    logs.push(newLog);
  }
  
  await writeData('energy-log.json', logs);
  return newLog;
}

export async function getTodayEnergy(): Promise<EnergyLog | undefined> {
    const logs = await getEnergyLog();
    const today = getToday();
    return logs.find(log => log.date === today);
}


// Momentum Score Functions
export async function getMomentumHistory(): Promise<MomentumScore[]> {
    return readData<MomentumScore[]>('momentum.json');
}

export async function getLatestMomentum(): Promise<MomentumScore | undefined> {
    const history = await getMomentumHistory();
    return history.sort((a, b) => b.date.localeCompare(a.date))[0];
}

export async function saveMomentumScore(scoreData: Omit<MomentumScore, 'date'>): Promise<MomentumScore> {
    const history = await getMomentumHistory();
    const today = getToday();
    
    const newScore: MomentumScore = {
        ...scoreData,
        date: today,
    };
    
    const todayScoreIndex = history.findIndex(s => s.date === today);
    if (todayScoreIndex > -1) {
        history[todayScoreIndex] = newScore;
    } else {
        history.push(newScore);
    }
    
    await writeData('momentum.json', history);
    return newScore;
}

// Project Functions
export async function getProjects(): Promise<Project[]> {
    return readData<Project[]>('projects.json');
}

export async function addProject(projectData: Omit<Project, 'id'>): Promise<Project> {
    const projects = await getProjects();
    const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
    };
    const updatedProjects = [...projects, newProject];
    await writeData('projects.json', updatedProjects);
    return newProject;
}

export async function updateProject(projectId: string, updates: Partial<Project>): Promise<Project | undefined> {
    const projects = await getProjects();
    let updatedProject: Project | undefined;
    const updatedProjects = projects.map(p => {
        if (p.id === projectId) {
            updatedProject = { ...p, ...updates };
            return updatedProject;
        }
        return p;
    });

    if (!updatedProject) return undefined;

    await writeData('projects.json', updatedProjects);
    return updatedProject;
}

export async function deleteProject(projectId: string): Promise<void> {
    const projects = await getProjects();
    const updatedProjects = projects.filter(p => p.id !== projectId);
    await writeData('projects.json', updatedProjects);

    // Also delete tasks associated with the project
    const tasks = await getTasks();
    const updatedTasks = tasks.filter(t => t.projectId !== projectId);
    await writeData('tasks.json', updatedTasks);
}

// Recurring Task Functions
export async function getRecurringTasks(): Promise<RecurringTask[]> {
  return readData<RecurringTask[]>('recurring-tasks.json');
}

export async function addRecurringTask(taskData: Omit<RecurringTask, 'id' | 'lastCompleted'>): Promise<RecurringTask> {
  const tasks = await getRecurringTasks();
  const newTask: RecurringTask = {
    ...taskData,
    id: Date.now().toString(),
    lastCompleted: null,
  };
  const updatedTasks = [...tasks, newTask];
  await writeData('recurring-tasks.json', updatedTasks);
  return newTask;
}

export async function updateRecurringTask(taskId: string, updates: Partial<Omit<RecurringTask, 'id'>>): Promise<RecurringTask | undefined> {
  const tasks = await getRecurringTasks();
  let updatedTask: RecurringTask | undefined;
  const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
          updatedTask = { ...t, ...updates };
          return updatedTask;
      }
      return t;
  });

  if (!updatedTask) return undefined;
  
  await writeData('recurring-tasks.json', updatedTasks);
  return updatedTask;
}

// Report Functions
export async function getReports(): Promise<Record<string, DailyReport>> {
    return readData<Record<string, DailyReport>>('reports.json');
}

export async function getTodaysReport(): Promise<DailyReport> {
    const reports = await getReports();
    const today = getToday();
    
    // Recalculate stats every time
    const tasks = await getTasks();
    const todaysTasks = tasks.filter(t => t.createdAt && format(new Date(t.createdAt), 'yyyy-MM-dd') === today);

    const existingReport = reports[today] || {
        date: today,
        startTime: null,
        endTime: null,
        generatedReport: null,
    };
    
    const updatedReport = {
        ...existingReport,
        goals: todaysTasks.length,
        completed: todaysTasks.filter(t => t.completed).length,
        inProgress: todaysTasks.filter(t => !t.completed).length,
    };

    if (!reports[today] || JSON.stringify(reports[today]) !== JSON.stringify(updatedReport)) {
        reports[today] = updatedReport;
        await writeData('reports.json', reports);
    }
    
    return updatedReport;
}

export async function updateTodaysReport(updates: Partial<DailyReport>): Promise<DailyReport> {
    const reports = await getReports();
    const today = getToday();
    const todaysReport = await getTodaysReport(); // Ensures we have the latest stats

    reports[today] = { ...todaysReport, ...updates };
    await writeData('reports.json', reports);
    return reports[today];
}
