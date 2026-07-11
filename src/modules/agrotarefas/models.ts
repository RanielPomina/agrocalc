export type TaskPriority = 'normal' | 'high';

export type TaskItem = {
  id: string;
  title: string;
  fieldName?: string;
  notes?: string;
  priority: TaskPriority;
  done: boolean;
  createdAt: string;
  completedAt?: string;
};
