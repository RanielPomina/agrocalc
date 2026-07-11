import { readOutbox, removeOutboxItems } from './outbox';
import type { SyncResult, SyncTransport } from './types';

export class SyncCoordinator {
  constructor(private readonly transports: SyncTransport[]) {}

  async syncNow(): Promise<SyncResult | null> {
    const items = await readOutbox();

    for (const transport of this.transports) {
      if (await transport.isAvailable()) {
        const result = await transport.flush(items);
        await removeOutboxItems(items.slice(0, result.sent).map((item) => item.id));
        return result;
      }
    }

    return null;
  }
}