import { CloudSyncGateway } from '../cloud/cloudSyncGateway';
import { isSupabaseConfigured } from '../cloud/supabaseClient';
import { NoopLocalDiscoveryService } from '../p2p/localDiscovery';
import { LocalSyncGateway } from '../p2p/localSyncGateway';
import { SyncCoordinator } from './syncCoordinator';
import type { SyncTransport } from './types';

/**
 * Constrói o coordenador de sincronização.
 * O Supabase gateway é carregado por require lazy: se `@supabase/supabase-js`
 * falhar ao inicializar, cai silenciosamente no gateway stub (offline).
 */
export function createSyncCoordinator() {
  let cloud: SyncTransport = new CloudSyncGateway();
  if (isSupabaseConfigured()) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { SupabaseSyncGateway } = require('../cloud/supabaseSyncGateway');
      cloud = new SupabaseSyncGateway();
    } catch (error) {
       
      console.warn('[Sync] Supabase gateway indisponivel, usando stub:', error);
    }
  }
  return new SyncCoordinator([cloud, new LocalSyncGateway(new NoopLocalDiscoveryService())]);
}
