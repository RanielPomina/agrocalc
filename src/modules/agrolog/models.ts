export type AgroLogEntry = {
  id: string;
  workerId: string;
  fieldName: string;
  activity: string;
  startedAt: string;
  finishedAt?: string;
  notes?: string;
};