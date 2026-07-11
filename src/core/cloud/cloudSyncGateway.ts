import type { OutboxItem, SyncResult, SyncTransport } from '../sync/types';

export class CloudSyncGateway implements SyncTransport {
  readonly channel = 'cloud' as const;

  async isAvailable(): Promise<boolean> {
    return false;
  }

  async flush(items: OutboxItem[]): Promise<SyncResult> {
    return {
      sent: items.length,
      received: 0,
      channel: this.channel,
    };
  }
}