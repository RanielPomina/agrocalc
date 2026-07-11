import type { OutboxItem, SyncResult, SyncTransport } from '../sync/types';
import { getSupabaseClient, getSupabaseUrl, isSupabaseConfigured, supabaseTables } from './supabaseClient';

const outboxTypeToTable: Record<OutboxItem['type'], string> = {
  notice: supabaseTables.notices,
  'chat-message': supabaseTables.chatMessages,
  'agro-log': supabaseTables.agroLog,
};

export class SupabaseSyncGateway implements SyncTransport {
  readonly channel = 'cloud' as const;

  async isAvailable(): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const url = getSupabaseUrl();
    if (!url) return false;
    try {
      const response = await fetch(`${url}/auth/v1/health`, { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  }

  async flush(items: OutboxItem[]): Promise<SyncResult> {
    const client = getSupabaseClient();
    if (!client || items.length === 0) {
      return { sent: 0, received: 0, channel: this.channel };
    }

    let sent = 0;
    for (const item of items) {
      const table = outboxTypeToTable[item.type];
      if (!table) continue;
      try {
        const { error } = await client.from(table).insert({
          id: item.id,
          group_id: item.groupId,
          priority: item.priority,
          payload: item.payload,
          created_at: item.createdAt,
        });
        if (error) break;
        sent += 1;
      } catch {
        break;
      }
    }

    return { sent, received: 0, channel: this.channel };
  }
}
