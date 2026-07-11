export type PlanCode = 'solo' | 'operational' | 'talk-pro';

export type MonetizationPlan = {
  code: PlanCode;
  title: string;
  adsEnabled: boolean;
  maxGroups: number;
  maxMembersPerGroup: number;
  talkProEnabled: boolean;
};

export const plans: Record<PlanCode, MonetizationPlan> = {
  solo: {
    code: 'solo',
    title: 'Solo Gratis',
    adsEnabled: true,
    maxGroups: 0,
    maxMembersPerGroup: 1,
    talkProEnabled: false,
  },
  operational: {
    code: 'operational',
    title: 'Operacional',
    adsEnabled: false,
    maxGroups: 1,
    maxMembersPerGroup: 10,
    talkProEnabled: false,
  },
  'talk-pro': {
    code: 'talk-pro',
    title: 'Talk Pro',
    adsEnabled: false,
    maxGroups: 1,
    maxMembersPerGroup: 10,
    talkProEnabled: true,
  },
};