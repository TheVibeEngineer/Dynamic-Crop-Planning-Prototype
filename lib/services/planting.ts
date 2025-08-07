// =============================================================================
// PLANTING SERVICE - Planting Management and Calculations
// =============================================================================

import type { Planting, Variety, Order } from '@/types';

export const plantingService = {
  // Calculate total yield based on acres and variety yield per acre
  calculateTotalYield: (acres: number, yieldPerAcre: number): number => {
    return Math.round(acres * yieldPerAcre);
  },

  // Calculate harvest date based on plant date and days to harvest
  calculateHarvestDate: (plantDate: string, daysToHarvest: number): string => {
    const plant = new Date(plantDate);
    const harvest = new Date(plant.getTime() + (daysToHarvest * 24 * 60 * 60 * 1000));
    return harvest.toISOString().split('T')[0];
  },

  // Calculate acres needed based on volume and yield per acre
  calculateAcresNeeded: (volumeNeeded: number, yieldPerAcre: number): number => {
    if (yieldPerAcre <= 0) return 0;
    return Math.round((volumeNeeded / yieldPerAcre) * 100) / 100;
  },

  // Generate planting ID
  generatePlantingId: (): string => {
    return `planting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Create planting from order and variety
  createPlantingFromOrder: (order: Order, variety: Variety, plantDate: string): Planting => {
    const yieldPerAcre = variety.budgetYieldPerAcre[order.marketType] || 0;
    const acres = plantingService.calculateAcresNeeded(order.volume, yieldPerAcre);
    const harvestDate = plantingService.calculateHarvestDate(plantDate, variety.daysToHarvest);
    const totalYield = plantingService.calculateTotalYield(acres, yieldPerAcre);

    return {
      id: plantingService.generatePlantingId(),
      crop: order.commodity,
      variety: variety.name,
      acres,
      plantDate,
      harvestDate,
      marketType: order.marketType,
      customer: order.customer,
      volumeOrdered: order.volume,
      totalYield,
      budgetYieldPerAcre: yieldPerAcre,
      assigned: false,
      originalOrderId: order.id.toString(),
      budgetedDaysToHarvest: variety.daysToHarvest,
      bedSize: variety.bedSize,
      spacing: variety.spacing,
      budgetedHarvestDate: harvestDate,
      idealStandPerAcre: variety.idealStand
    };
  },

  // Assign planting to a specific lot
  assignToLot: (
    planting: Planting, 
    region: any, 
    ranch: any, 
    lot: any, 
    sublot: string
  ): Planting => {
    return {
      ...planting,
      assigned: true,
      region: region.region,
      ranch: ranch.name,
      lot: lot.number,
      sublot,
      uniqueLotId: `${region.id}-${ranch.id}-${lot.id}`,
      displayLotId: `${region.region} > ${ranch.name} > Lot ${lot.number}${sublot ? `-${sublot}` : ''}`,
      assignedLot: {
        regionId: region.id,
        ranchId: ranch.id,
        lotId: lot.id,
        sublot
      }
    };
  },

  // Split planting into assigned and unassigned portions
  splitPlanting: (originalPlanting: Planting, maxAcres: number) => {
    const timestamp = new Date().toISOString();
    const parentId = originalPlanting.parentPlantingId || originalPlanting.id;
    const nextSequence = (originalPlanting.splitSequence || 0) + 1;

    const assignedPortion: Planting = {
      ...originalPlanting,
      id: `${parentId}_split_${nextSequence}`,
      acres: maxAcres,
      totalYield: plantingService.calculateTotalYield(maxAcres, originalPlanting.budgetYieldPerAcre || 0),
      splitSequence: nextSequence,
      parentPlantingId: parentId,
      splitTimestamp: timestamp,
      assigned: false // Will be assigned after creation
    };

    const remainingAcres = Math.round((originalPlanting.acres - maxAcres) * 100) / 100;
    const unassignedRemainder: Planting = {
      ...originalPlanting,
      id: `${parentId}_split_${nextSequence + 1}`,
      acres: remainingAcres,
      totalYield: plantingService.calculateTotalYield(remainingAcres, originalPlanting.budgetYieldPerAcre || 0),
      splitSequence: nextSequence + 1,
      parentPlantingId: parentId,
      splitTimestamp: timestamp,
      assigned: false
    };

    return { assignedPortion, unassignedRemainder };
  }
};
