import { writeDoc, readDoc, clearDoc } from '../../core/storage/localStore';

type StoredCrashLog = {
  message: string;
  stack?: string;
  when: string;
  fatal: boolean;
};

let installed = false;

/**
 * Instala handler global de erros JS. Grava a última exceção no AsyncStorage
 * para que o ErrorBoundary possa mostrá-la no próximo boot mesmo que o crash
 * tenha derrubado o app antes do React montar.
 */
export function installGlobalErrorLogger(): void {
  if (installed) return;
  installed = true;

  // @ts-expect-error ErrorUtils é global do RN, sem tipagem exposta
  const originalHandler = global.ErrorUtils?.getGlobalHandler?.();

  // @ts-expect-error mesmo motivo
  global.ErrorUtils?.setGlobalHandler?.((error: Error, isFatal?: boolean) => {
    const payload: StoredCrashLog = {
      message: error?.message ?? String(error),
      stack: error?.stack,
      when: new Date().toISOString(),
      fatal: Boolean(isFatal),
    };
    void writeDoc('crashLog', payload).catch(() => {
      /* silencioso: se o storage falhar, ainda propagamos o erro */
    });
    if (typeof originalHandler === 'function') {
      originalHandler(error, isFatal);
    }
  });
}

export async function readStoredCrashLog(): Promise<StoredCrashLog | null> {
  return readDoc<StoredCrashLog>('crashLog');
}

export async function clearStoredCrashLog(): Promise<void> {
  await clearDoc('crashLog');
}
