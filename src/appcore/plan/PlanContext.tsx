import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { readDoc, writeDoc } from '../../core/storage/localStore';
import { plans, type MonetizationPlan, type PlanCode } from '../../modules/monetization/plans';

type PlanContextValue = {
  plan: MonetizationPlan;
  planCode: PlanCode;
  hydrated: boolean;
  setPlan: (code: PlanCode) => Promise<void>;
};

const PlanContext = createContext<PlanContextValue | undefined>(undefined);

async function loadStoredPlan(): Promise<PlanCode> {
  const stored = await readDoc<{ code: PlanCode }>('planState');
  return stored?.code ?? 'solo';
}

async function saveStoredPlan(code: PlanCode): Promise<void> {
  await writeDoc('planState', { code });
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [planCode, setPlanCode] = useState<PlanCode>('solo');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    loadStoredPlan()
      .then((code) => {
        if (alive) setPlanCode(code);
      })
      .finally(() => {
        if (alive) setHydrated(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const setPlan = useCallback(async (code: PlanCode) => {
    setPlanCode(code);
    await saveStoredPlan(code);
  }, []);

  const value = useMemo(
    () => ({
      plan: plans[planCode],
      planCode,
      hydrated,
      setPlan,
    }),
    [planCode, hydrated, setPlan],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    throw new Error('usePlan precisa estar dentro de <PlanProvider>');
  }
  return ctx;
}
