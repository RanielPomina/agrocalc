import { CloudSyncGateway } from '../cloud/cloudSyncGateway';
import { NoopLocalDiscoveryService } from '../p2p/localDiscovery';
import { LocalSyncGateway } from '../p2p/localSyncGateway';
import { SyncCoordinator } from './syncCoordinator';

export function createSyncCoordinator() {
  return new SyncCoordinator([
    new CloudSyncGateway(),
    new LocalSyncGateway(new NoopLocalDiscoveryService()),
  ]);
}