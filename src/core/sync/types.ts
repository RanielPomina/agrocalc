export type SyncChannel = 'cloud' | 'local-p2p';

export type OutboxPriority = 'normal' | 'priority' | 'notice';

export type OutboxItem = {
  id: string;
  groupId: string;
  type: 'notice' | 'chat-message' | 'agro-log';
  priority: OutboxPriority;
  payload: Record<string, unknown>;
  createdAt: string;
  attempts: number;
};

export type SyncResult = {
  sent: number;
  received: number;
  channel: SyncChannel;
};

export interface SyncTransport {
  readonly channel: SyncChannel;
  isAvailable(): Promise<boolean>;
  flush(items: OutboxItem[]): Promise<SyncResult>;
}