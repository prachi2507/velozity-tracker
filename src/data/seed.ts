import { Task, Priority, Status } from '../types';

const titles = [
  'Fix login bug','Update dashboard','Write tests','Deploy to staging',
  'Review PR','Update docs','Refactor auth','Add dark mode',
  'Fix mobile layout','Optimise queries','Setup CI/CD','Code review',
];
const priorities: Priority[] = ['Critical','High','Medium','Low'];
const statuses: Status[] = ['To Do','In Progress','In Review','Done'];

function randomDate(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

export const USERS = [
  { id: 'u1', name: 'Alice Ray', color: '#6366f1' },
  { id: 'u2', name: 'Bob Singh', color: '#ec4899' },
  { id: 'u3', name: 'Carol T', color: '#f59e0b' },
  { id: 'u4', name: 'David K', color: '#10b981' },
  { id: 'u5', name: 'Eva M', color: '#3b82f6' },
  { id: 'u6', name: 'Frank O', color: '#ef4444' },
];

export function generateTasks(count = 500): Task[] {
  return Array.from({ length: count }, (_, i) => {
    const hasStart = Math.random() > 0.2;
    const daysOffset = Math.floor(Math.random() * 60) - 20;
    return {
      id: `task-${i}`,
      title: `${titles[i % titles.length]} ${i + 1}`,
      assigneeId: USERS[i % USERS.length].id,
      priority: priorities[i % priorities.length],
      status: statuses[i % statuses.length],
      startDate: hasStart ? randomDate(daysOffset - 10) : null,
      dueDate: randomDate(daysOffset),
    };
  });
}