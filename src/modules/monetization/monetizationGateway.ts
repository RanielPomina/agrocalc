import type { PlanCode } from './plans';

export type PurchaseIntent = {
  plan: PlanCode | 'extra-group' | 'extra-workers-10' | 'remove-worker-ads';
  accountId: string;
};

export interface MonetizationGateway {
  showNativeAd(placement: 'home' | 'tool-footer'): Promise<void>;
  purchase(intent: PurchaseIntent): Promise<void>;
  restorePurchases(accountId: string): Promise<void>;
}