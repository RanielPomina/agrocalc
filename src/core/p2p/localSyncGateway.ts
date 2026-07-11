import type { OutboxItem, SyncResult, SyncTransport } from '../sync/types';
import type { LocalDiscoveryService } from './localDiscovery';

export class LocalSyncGateway implements SyncTransport {
  readonly channel = 'local-p2p' as const;

  constructor(private readonly discovery: LocalDiscoveryService) {}

  async isAvailable(): Promise<boolean> {
    const peers = await this.discovery.scan();
    return peers.length > 0;
  }

  async flush(items: OutboxItem[]): Promise<SyncResult> {
    return {
      sent: items.length,
      received: 0,
      channel: this.channel,
    };
  }
}