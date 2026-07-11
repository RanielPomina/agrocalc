import { CloudSyncGateway } from '../cloud/cloudSyncGateway';
import { isSupabaseConfigured } from '../cloud/supabaseClient';
import { SupabaseSyncGateway } from '../cloud/supabaseSyncGateway';
import { NoopLocalDiscoveryService } from '../p2p/localDiscovery';
import { LocalSyncGateway } from '../p2p/localSyncGateway';
import { SyncCoordinator } from './syncCoordinator';

export function createSyncCoordinator() {
  const cloud = isSupabaseConfigured() ? new SupabaseSyncGateway() : new CloudSyncGateway();
  return new SyncCoordinator([cloud, new LocalSyncGateway(new NoopLocalDiscoveryService())]);
}