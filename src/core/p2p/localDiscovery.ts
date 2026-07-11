export type LocalPeer = {
  id: string;
  name: string;
  host: string;
  port: number;
  role: 'admin-device' | 'local-server';
};

export interface LocalDiscoveryService {
  scan(): Promise<LocalPeer[]>;
  stop(): Promise<void>;
}

export class NoopLocalDiscoveryService implements LocalDiscoveryService {
  async scan(): Promise<LocalPeer[]> {
    return [];
  }

  async stop(): Promise<void> {
    return undefined;
  }
}