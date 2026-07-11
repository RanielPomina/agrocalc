import { readDoc, writeDoc, clearDoc } from '../../core/storage/localStore';

export type SessionRole = 'admin' | 'worker';

export type SessionState = {
  displayName: string;
  role: SessionRole;
  groupCode: string;
  createdAt: string;
};

export async function loadSession(): Promise<SessionState | null> {
  return readDoc<SessionState>('session');
}

export async function saveSession(session: SessionState): Promise<void> {
  await writeDoc('session', session);
}

export async function clearSession(): Promise<void> {
  await clearDoc('session');
}
