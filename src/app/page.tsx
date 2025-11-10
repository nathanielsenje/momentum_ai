import {
  getTasks,
  getTodayEnergy,
  getLatestMomentum,
  getCategories,
} from '@/lib/data';
import { getSuggestedTasks } from '@/app/actions';
import { EnergyInput } from '@/components/dashboard/energy-input';
import { MomentumCard } from '@/components/dashboard/momentum-card';
import { SuggestedTasks } from '@/components/dashboard/suggested-tasks';
import { TaskList } from '@/components/dashboard/task-list';

export default async function DashboardPage() {
  const [tasks, todayEnergy, latestMomentum, categories] = await Promise.all([
    getTasks(),
    getTodayEnergy(),
    getLatestMomentum(),
    getCategories(),
  ]);

  const suggestedTasksData = todayEnergy
    ? await getSuggestedTasks(todayEnergy.level)
    : { suggestedTasks: '' };

  const suggestedTasks =
    suggestedTasksData.suggestedTasks.length > 0
      ? suggestedTasksData.suggestedTasks.split(',').map((t) => t.trim())
      : [];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline">
        Dashboard
      </h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <MomentumCard latestMomentum={latestMomentum} />
        </div>
        <div className="lg:col-span-2">
          <EnergyInput todayEnergy={todayEnergy} />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <SuggestedTasks
            suggestedTasks={suggestedTasks}
            energyLevel={todayEnergy?.level}
          />
        </div>
        <div className="xl:col-span-2">
          <TaskList tasks={tasks} categories={categories} todayEnergy={todayEnergy} />
        </div>
      </div>
    </div>
  );
}
