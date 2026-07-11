export type AgroCalcRecord = {
  id: string;
  crop: string;
  areaHectares: number;
  seedKgPerHectare: number;
  inputCostPerHectare: number;
  expectedYieldBagsPerHectare: number;
  createdAt: string;
};

export type AgroCalcResult = {
  totalSeedKg: number;
  totalInputCost: number;
  expectedYieldBags: number;
};