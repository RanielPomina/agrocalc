import type { StockBalance, StockMovement } from './models';

export function calculateStockBalance(movements: StockMovement[]): StockBalance[] {
  const balances = new Map<string, StockBalance>();

  for (const movement of movements) {
    const key = `${movement.itemName}:${movement.unit}`;
    const current = balances.get(key) ?? { itemName: movement.itemName, unit: movement.unit, quantity: 0 };
    const direction = movement.type === 'outbound' ? -1 : 1;

    balances.set(key, {
      ...current,
      quantity: current.quantity + movement.quantity * direction,
    });
  }

  return Array.from(balances.values());
}