import { useEffect, useRef } from 'react';

import { createSyncCoordinator } from '../sync/createSyncCoordinator';
import { readOutbox } from '../sync/outbox';

export type ConnectivitySnapshot = {
  isInternetReachable: boolean | null;
  type: string | null;
};

async function loadNetwork(): Promise<any | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-network');
  } catch {
    return null;
  }
}

export async function checkConnectivity(): Promise<ConnectivitySnapshot> {
  try {
    const Network = await loadNetwork();
    if (!Network || typeof Network.getNetworkStateAsync !== 'function') {
      return { isInternetReachable: null, type: null };
    }
    const state = await Network.getNetworkStateAsync();
    return {
      isInternetReachable: state.isInternetReachable ?? state.isConnected ?? null,
      type: state.type ?? null,
    };
  } catch {
    return { isInternetReachable: null, type: null };
  }
}

/**
 * Faz polling leve de conectividade e dispara flush da Outbox quando fica online.
 * Se `expo-network` não estiver disponível, vira no-op silencioso.
 */
export function useAutoSyncOnOnline(intervalMs = 30_000): void {
  const wasOnline = useRef<boolean>(false);
  const syncing = useRef<boolean>(false);

  useEffect(() => {
    let alive = true;
    let coordinator: ReturnType<typeof createSyncCoordinator> | null = null;
    try {
      coordinator = createSyncCoordinator();
    } catch {
      coordinator = null;
    }

    async function tick() {
      if (!alive || syncing.current || !coordinator) return;
      const snapshot = await checkConnectivity();
      const online = snapshot.isInternetReachable === true;

      if (online && !wasOnline.current) {
        try {
          const pending = await readOutbox();
          if (pending.length > 0) {
            syncing.current = true;
            await coordinator.syncNow();
          }
        } catch {
          /* silencioso: próximo ciclo tenta de novo */
        } finally {
          syncing.current = false;
        }
      }
      wasOnline.current = online;
    }

    void tick();
    const timer = setInterval(() => {
      void tick();
    }, intervalMs);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [intervalMs]);
}
