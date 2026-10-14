export const TASK_CATEGORY_RESEARCH = 'PESQUISA';
export const TASK_CATEGORY_PRACTICE = 'PRATICA';
export const TASK_CATEGORY_WATCH_VIDEO = 'ASSISTIR_VIDEOAULA';

export const TASK_CATEGORIES = [
  TASK_CATEGORY_RESEARCH,
  TASK_CATEGORY_PRACTICE,
  TASK_CATEGORY_WATCH_VIDEO,
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export interface TaskLog {
  id: number;
  enrollmentId: number;
  date: string;
  category: TaskCategory;
  description: string;
  timeSpent: string;
  createdAt: string;
}

export interface TaskLogInput {
  date: string;
  category: TaskCategory;
  description: string;
  timeSpent: string;
}
