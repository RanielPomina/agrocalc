import { appendRecord, readCollection, writeCollection } from '../storage/localStore';
import type { OutboxItem } from './types';

const priorityRank: Record<OutboxItem['priority'], number> = {
  notice: 0,
  priority: 1,
  normal: 2,
};

export async function enqueueOutboxItem(item: OutboxItem): Promise<void> {
  await appendRecord('outbox', item);
}

export async function readOutbox(): Promise<OutboxItem[]> {
  const items = await readCollection<OutboxItem>('outbox');
  return items.sort((left, right) => priorityRank[left.priority] - priorityRank[right.priority]);
}

export async function removeOutboxItems(sentIds: string[]): Promise<void> {
  const sent = new Set(sentIds);
  const items = await readCollection<OutboxItem>('outbox');
  await writeCollection(
    'outbox',
    items.filter((item) => !sent.has(item.id)),
  );
}