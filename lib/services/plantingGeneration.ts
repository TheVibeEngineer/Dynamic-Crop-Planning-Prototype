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

      // For each variety in the commodity
      commodity.varieties.forEach((variety: Variety) => {
        // Check if this variety supports the order's market type
        const daysToHarvest = variety.daysToHarvest[order.marketType];
        const yieldPerAcre = variety.budgetYieldPerAcre[order.marketType];
        
        if (!daysToHarvest || !yieldPerAcre) {
          return; // Skip if variety doesn't support this market type
        }

        // Calculate plant date
        const deliveryDate = new Date(order.deliveryDate);
        const plantDate = new Date(deliveryDate);
        plantDate.setDate(plantDate.getDate() - daysToHarvest);

        // Use the planting service to create the planting
        // Create a variety object with the specific daysToHarvest for this market type
        const varietyForMarketType = {
          ...variety,
          daysToHarvest: daysToHarvest
        };
        
        const planting = plantingService.createPlantingFromOrder(
          order as any, // Type assertion for compatibility
          varietyForMarketType as any,
          plantDate.toISOString().split('T')[0]
        );

        plantings.push(planting);
      });
    });

    console.log(`✅ Generated ${plantings.length} plantings from ${orders.length} orders`);
    return plantings;
  }
};
