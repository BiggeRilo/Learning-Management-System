import type { TaskCategory } from '../models/task-log';

const LABELS: Record<TaskCategory, string> = {
  PESQUISA: 'Pesquisa',
  PRATICA: 'Prática',
  ASSISTIR_VIDEOAULA: 'Assistir videoaula',
};

export function taskCategoryLabel(category: TaskCategory): string {
  return LABELS[category];
}

export function taskCategoryIcon(category: TaskCategory): string {
  switch (category) {
    case 'PESQUISA':
      return 'search';
    case 'PRATICA':
      return 'handyman';
    case 'ASSISTIR_VIDEOAULA':
      return 'smart_display';
  }
}
