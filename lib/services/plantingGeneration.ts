// =============================================================================
// PLANTING GENERATION SERVICE - Generate plantings from orders
// =============================================================================

import { plantingService } from './planting';
import type { Planting } from '@/types/planning';
import type { Variety, Commodity } from '@/types/commodities';
import type { Order } from '@/types/orders';

export const plantingGenerationService = {
  /**
   * Generate plantings from orders
   */
  generateFromOrders(orders: Order[], commodities: Commodity[]): Planting[] {
    const plantings: Planting[] = [];

    orders.forEach((order) => {
      const commodity = commodities.find(c => c.name === order.commodity);
      if (!commodity) {
        console.warn(`❌ Commodity "${order.commodity}" not found`);
        return;
      }

      // Find varieties that support this order's market type
      const suitableVarieties = commodity.varieties.filter(variety => 
        variety.marketTypes.includes(order.marketType) && 
        variety.budgetYieldPerAcre[order.marketType] > 0
      );

      if (suitableVarieties.length === 0) {
        console.warn(`❌ No suitable varieties found for ${order.commodity} with market type ${order.marketType}`);
        return;
      }

      // Use the first suitable variety (or implement selection logic)
      const variety = suitableVarieties[0];
      const yieldPerAcre = variety.budgetYieldPerAcre[order.marketType];
      const daysToHarvest = variety.daysToHarvest;

      // Calculate plant date
      const deliveryDate = new Date(order.deliveryDate);
      const plantDate = new Date(deliveryDate);
      plantDate.setDate(plantDate.getDate() - daysToHarvest);

      // Use the planting service to create the planting
      const planting = plantingService.createPlantingFromOrder(
        order as any, // Type assertion for compatibility
        variety as any,
        plantDate.toISOString().split('T')[0]
      );

      plantings.push(planting);
    });

    console.log(`✅ Generated ${plantings.length} plantings from ${orders.length} orders`);
    return plantings;
  }
};
