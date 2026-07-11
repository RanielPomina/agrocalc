import { useEffect, useRef } from 'react';
import * as Network from 'expo-network';

import { createSyncCoordinator } from '../sync/createSyncCoordinator';
import { readOutbox } from '../sync/outbox';

export type ConnectivitySnapshot = {
  isInternetReachable: boolean | null;
  type: string | null;
};

export async function checkConnectivity(): Promise<ConnectivitySnapshot> {
  try {
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
 * Só flusha se houver itens na fila para evitar chamadas ociosas.
 */
export function useAutoSyncOnOnline(intervalMs = 15_000): void {
  const wasOnline = useRef<boolean>(false);
  const syncing = useRef<boolean>(false);

  useEffect(() => {
    const coordinator = createSyncCoordinator();

    async function tick() {
      if (syncing.current) return;
      const snapshot = await checkConnectivity();
      const online = snapshot.isInternetReachable === true;

      if (online && !wasOnline.current) {
        const pending = await readOutbox();
        if (pending.length > 0) {
          syncing.current = true;
          try {
            await coordinator.syncNow();
          } catch {
            /* silencioso: próximo ciclo tenta de novo */
          } finally {
            syncing.current = false;
          }
        }
      }
      wasOnline.current = online;
    }

    void tick();
    const timer = setInterval(() => {
      void tick();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);
}
