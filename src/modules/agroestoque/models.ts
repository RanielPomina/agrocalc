export type StockMovementType = 'inbound' | 'outbound' | 'adjustment';

export type StockMovement = {
  id: string;
  itemName: string;
  unit: 'kg' | 'l' | 'bag' | 'unit';
  quantity: number;
  type: StockMovementType;
  note?: string;
  createdAt: string;
};

export type StockBalance = {
  itemName: string;
  unit: StockMovement['unit'];
  quantity: number;
};