
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  limit,
  orderBy,
  writeBatch,
  getDoc,
  setDoc,
  Firestore,
} from 'firebase/firestore';
import type { Task, Category, EnergyLog, MomentumScore, EnergyLevel, Project, RecurringTask, DailyReport } from './types';
import { format } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const categories: Category[] = [
  { "id": "work", "name": "Work" },
  { "id": "personal", "name": "Personal" },
  { "id": "learning", "name": "Learning" },
  { "id": "health", "name": "Health" },
  { "id": "chore", "name": "Chore" }
];

const getToday = () => format(new Date(), 'yyyy-MM-dd');

// Task Functions
export async function getTasks(db: Firestore, userId: string): Promise<Task[]> {
  const tasksCol = collection(db, 'users', userId, 'tasks');
  const taskSnapshot = await getDocs(tasksCol);
  const taskList = taskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  return taskList;
}

export async function addTask(db: Firestore, userId: string, taskData: Omit<Task, 'id' | 'userId' | 'completed' | 'completedAt' | 'createdAt'>): Promise<Task> {
    console.log('[DEBUG] addTask called', {
        db: db ? 'DEFINED' : 'UNDEFINED',
        userId: userId || 'UNDEFINED',
        taskName: taskData.name
    });

    if (!db) {
        throw new Error('addTask: db parameter is undefined');
    }
    if (!userId) {
        throw new Error('addTask: userId parameter is undefined');
    }

    const tasksCol = collection(db, 'users', userId, 'tasks');
    console.log('[DEBUG] tasksCol created:', tasksCol ? 'DEFINED' : 'UNDEFINED');

    const newTaskData = {
        ...taskData,
        userId,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
    };

    console.log('[DEBUG] About to call addDoc');
    const docRef = await addDoc(tasksCol, newTaskData);
    console.log('[DEBUG] addDoc successful, docRef.id:', docRef.id);
    return { id: docRef.id, ...newTaskData };
}

export function updateTask(db: Firestore, userId: string, taskId: string, updates: Partial<Omit<Task, 'id'>>): Promise<void> {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    return updateDoc(taskRef, updates)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: taskRef.path,
          operation: 'update',
          requestResourceData: updates,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
}

export function deleteTask(db: Firestore, userId: string, taskId: string): Promise<void> {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    return deleteDoc(taskRef)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: taskRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
}

// Category Functions - Now from an in-memory array as they are static
export function getCategories(): Category[] {
  return categories;
}

// Energy Log Functions
export async function getEnergyLog(db: Firestore, userId: string): Promise<EnergyLog[]> {
    const logCol = collection(db, 'users', userId, 'energy-log');
    const logSnapshot = await getDocs(logCol);
    return logSnapshot.docs.map(doc => doc.data() as EnergyLog);
}

export function setTodayEnergy(db: Firestore, userId: string, level: EnergyLevel): Promise<void> {
    const today = getToday();
    const logRef = doc(db, 'users', userId, 'energy-log', today);
    const newLog: EnergyLog = { date: today, level, userId };

    return setDoc(logRef, newLog, { merge: true })
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: logRef.path,
          operation: 'write',
          requestResourceData: newLog,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
}

export async function getTodayEnergy(db: Firestore, userId: string): Promise<EnergyLog | undefined> {
    const today = getToday();
    const logRef = doc(db, 'users', userId, 'energy-log', today);
    const docSnap = await getDoc(logRef);
    return docSnap.exists() ? docSnap.data() as EnergyLog : undefined;
}

// Momentum Score Functions
export async function getMomentumHistory(db: Firestore, userId: string): Promise<MomentumScore[]> {
    const momentumCol = collection(db, 'users', userId, 'momentum');
    const q = query(momentumCol, orderBy('date', 'desc'));
    const momentumSnapshot = await getDocs(q);
    return momentumSnapshot.docs.map(doc => doc.data() as MomentumScore);
}

export async function getLatestMomentum(db: Firestore, userId: string): Promise<MomentumScore | undefined> {
    const momentumCol = collection(db, 'users', userId, 'momentum');
    const q = query(momentumCol, orderBy('date', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return undefined;
    }
    return snapshot.docs[0].data() as MomentumScore;
}

export function saveMomentumScore(db: Firestore, userId: string, scoreData: Omit<MomentumScore, 'date' | 'userId'>): Promise<void> {
    const today = getToday();
    const momentumRef = doc(db, 'users', userId, 'momentum', today);
    const newScore: MomentumScore = { ...scoreData, date: today, userId };

    return setDoc(momentumRef, newScore, { merge: true })
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: momentumRef.path,
          operation: 'write',
          requestResourceData: newScore,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
}

// Project Functions
export async function getProjects(db: Firestore, userId: string): Promise<Project[]> {
    const projectsCol = collection(db, 'users', userId, 'projects');
    const projectSnapshot = await getDocs(projectsCol);
    return projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
}

export async function addProject(db: Firestore, userId: string, projectData: Omit<Project, 'id' | 'userId'>): Promise<Project> {
    console.log('[DEBUG] addProject called', {
        db: db ? 'DEFINED' : 'UNDEFINED',
        userId: userId || 'UNDEFINED',
        projectName: projectData.name
    });

    if (!db) {
        throw new Error('addProject: db parameter is undefined');
    }
    if (!userId) {
        throw new Error('addProject: userId parameter is undefined');
    }

    const projectsCol = collection(db, 'users', userId, 'projects');
    console.log('[DEBUG] projectsCol created:', projectsCol ? 'DEFINED' : 'UNDEFINED');

    const dataWithUserId = { ...projectData, userId };

    console.log('[DEBUG] About to call addDoc for project');
    const docRef = await addDoc(projectsCol, dataWithUserId);
    console.log('[DEBUG] addDoc successful for project, docRef.id:', docRef.id);
    return { id: docRef.id, ...dataWithUserId };
}

export function updateProject(db: Firestore, userId: string, projectId: string, updates: Partial<Project>): Promise<void> {
    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    return updateDoc(projectRef, updates)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: projectRef.path,
          operation: 'update',
          requestResourceData: updates,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
}

export async function deleteProject(db: Firestore, userId: string, projectId: string) {
    const projectRef = doc(db, 'users', userId, 'projects', projectId);

    const tasksCol = collection(db, 'users', userId, 'tasks');
    const q = query(tasksCol, where('projectId', '==', projectId));
    
    try {
        const tasksSnapshot = await getDocs(q);
        const batch = writeBatch(db);
        tasksSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        batch.delete(projectRef); // Also delete the project itself
        await batch.commit();
    } catch(e) {
        // This is a complex operation, if it fails, we surface a generic error for now
        // A more robust solution might involve a cloud function.
        console.error("Failed to delete project and its tasks", e);
        const permissionError = new FirestorePermissionError({
          path: projectRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    }
}


// Recurring Task Functions
export async function getRecurringTasks(db: Firestore, userId: string): Promise<RecurringTask[]> {
  const tasksCol = collection(db, 'users', userId, 'recurring-tasks');
  const snapshot = await getDocs(tasksCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecurringTask));
}

export function addRecurringTask(db: Firestore, userId: string, taskData: Omit<RecurringTask, 'id' | 'lastCompleted' | 'userId'>): Promise<void> {
    const tasksCol = collection(db, 'users', userId, 'recurring-tasks');
    const newTaskData = { ...taskData, lastCompleted: null, userId };
    return addDoc(tasksCol, newTaskData)
    .then(() => {})
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: tasksCol.path,
          operation: 'create',
          requestResourceData: newTaskData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
}

export function updateRecurringTask(db: Firestore, userId: string, taskId: string, updates: Partial<Omit<RecurringTask, 'id'>>): Promise<void> {
    const taskRef = doc(db, 'users', userId, 'recurring-tasks', taskId);
    return updateDoc(taskRef, updates)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: taskRef.path,
          operation: 'update',
          requestResourceData: updates,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
}

// Report Functions
export async function getReports(db: Firestore, userId: string): Promise<Record<string, DailyReport>> {
    const reportsCol = collection(db, 'users', userId, 'reports');
    const snapshot = await getDocs(reportsCol);
    const reports: Record<string, DailyReport> = {};
    snapshot.forEach(doc => {
        reports[doc.id] = doc.data() as DailyReport;
    });
    return reports;
}

export async function getTodaysReport(db: Firestore, userId: string): Promise<DailyReport> {
    const today = getToday();
    const reportRef = doc(db, 'users', userId, 'reports', today);
    const reportSnap = await getDoc(reportRef);

    const tasks = await getTasks(db, userId);
    const todaysTasks = tasks.filter(t => t.createdAt && format(new Date(t.createdAt), 'yyyy-MM-dd') === today);
    
    const defaultReport: DailyReport = {
        date: today,
        userId: userId,
        startTime: null,
        endTime: null,
        generatedReport: null,
        goals: 0,
        completed: 0,
        inProgress: 0,
    };
    
    const existingReport = reportSnap.exists() ? reportSnap.data() as DailyReport : defaultReport;

    const updatedReport = {
        ...existingReport,
        goals: todaysTasks.length,
        completed: todaysTasks.filter(t => t.completed).length,
        inProgress: todaysTasks.filter(t => !t.completed).length,
    };

    if (!reportSnap.exists() || JSON.stringify(existingReport) !== JSON.stringify(updatedReport)) {
        await setDoc(reportRef, updatedReport, { merge: true });
    }

    return updatedReport;
}

export async function updateTodaysReport(db: Firestore, userId: string, updates: Partial<DailyReport>): Promise<DailyReport> {
    const today = getToday();
    const reportRef = doc(db, 'users', userId, 'reports', today);

    const currentReport = await getTodaysReport(db, userId);
    const newReportData = { ...currentReport, ...updates };
    await setDoc(reportRef, newReportData, { merge: true });
    return newReportData;
}

// User Profile
export function updateUserProfile(db: Firestore, userId: string, updates: { displayName: string }): Promise<void> {
  const userRef = doc(db, 'users', userId);
  return updateDoc(userRef, updates)
  .catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: userRef.path,
      operation: 'update',
      requestResourceData: updates,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}

export function createUserProfile(db: Firestore, userId: string, data: { email: string | null; displayName: string | null; photoURL: string | null }): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const profileData = {
      id: userId,
      ...data,
    }
    return setDoc(userRef, profileData, { merge: true })
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: profileData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}
