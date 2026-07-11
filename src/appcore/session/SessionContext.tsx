import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { clearSession, loadSession, saveSession, type SessionState } from './sessionStorage';

type SessionContextValue = {
  session: SessionState | null;
  hydrated: boolean;
  signIn: (session: SessionState) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    loadSession()
      .then((loaded) => {
        if (alive) setSession(loaded);
      })
      .finally(() => {
        if (alive) setHydrated(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const signIn = useCallback(async (next: SessionState) => {
    await saveSession(next);
    setSession(next);
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, hydrated, signIn, signOut }),
    [session, hydrated, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession precisa estar dentro de <SessionProvider>');
  }
  return ctx;
}
