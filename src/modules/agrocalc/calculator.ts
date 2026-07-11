import type { AgroCalcRecord, AgroCalcResult } from './models';

export function calculateAgroInputs(record: AgroCalcRecord): AgroCalcResult {
  return {
    totalSeedKg: record.areaHectares * record.seedKgPerHectare,
    totalInputCost: record.areaHectares * record.inputCostPerHectare,
    expectedYieldBags: record.areaHectares * record.expectedYieldBagsPerHectare,
  };
}