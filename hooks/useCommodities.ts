// =============================================================================
// USE COMMODITIES HOOK - Commodities and varieties state management
// =============================================================================

import { useState, useEffect } from 'react';
import type { Commodity, Variety, CommoditiesActions } from '@/types/commodities';
import { persistenceService } from '@/lib/services/persistence';
import { STORAGE_KEYS } from '@/lib/constants';

export const useCommodities = (): CommoditiesActions & { commodities: Commodity[] } => {
  // Default commodities data
  const defaultCommodities: Commodity[] = [
    {
      id: 1,
      name: 'Romaine',
      varieties: [
        { 
          id: 1, name: 'Green Forest', growingWindow: { start: 'Mar', end: 'Nov' }, daysToHarvest: 60,
          bedSize: '38-2', spacing: '12in', plantType: 'Transplant', idealStand: 30000,
          marketTypes: ['Fresh Cut'], budgetYieldPerAcre: { 'Fresh Cut': 1200, 'Bulk': 0 },
          preferences: { Jan: 0, Feb: 0, Mar: 10, Apr: 15, May: 20, Jun: 20, Jul: 15, Aug: 10, Sep: 5, Oct: 5, Nov: 0, Dec: 0 }
        },
        { 
          id: 2, name: 'Parris Island Cos', growingWindow: { start: 'Apr', end: 'Oct' }, daysToHarvest: 58,
          bedSize: '38-2', spacing: '12in', plantType: 'Transplant', idealStand: 32000,
          marketTypes: ['Fresh Cut', 'Bulk'], budgetYieldPerAcre: { 'Fresh Cut': 1100, 'Bulk': 25000 },
          preferences: { Jan: 0, Feb: 0, Mar: 5, Apr: 20, May: 25, Jun: 25, Jul: 15, Aug: 10, Sep: 0, Oct: 0, Nov: 0, Dec: 0 }
        }
      ]
    },
    {
      id: 2, name: 'Iceberg',
      varieties: [
        { 
          id: 3, name: 'Great Lakes', growingWindow: { start: 'Apr', end: 'Oct' }, daysToHarvest: 65,
          bedSize: '38-2', spacing: '12in', plantType: 'Transplant', idealStand: 28000,
          marketTypes: ['Fresh Cut'], budgetYieldPerAcre: { 'Fresh Cut': 1000, 'Bulk': 0 },
          preferences: { Jan: 0, Feb: 0, Mar: 0, Apr: 20, May: 25, Jun: 25, Jul: 20, Aug: 10, Sep: 0, Oct: 0, Nov: 0, Dec: 0 }
        }
      ]
    },
    {
      id: 3, name: 'Carrots',
      varieties: [
        { 
          id: 4, name: 'Nantes', growingWindow: { start: 'Feb', end: 'Nov' }, daysToHarvest: 90,
          bedSize: '38-2', spacing: '2in', plantType: 'Direct Seed', idealStand: 500000,
          marketTypes: ['Bulk'], budgetYieldPerAcre: { 'Fresh Cut': 0, 'Bulk': 45000 },
          preferences: { Jan: 0, Feb: 10, Mar: 15, Apr: 15, May: 15, Jun: 15, Jul: 15, Aug: 10, Sep: 5, Oct: 0, Nov: 0, Dec: 0 }
        }
      ]
    }
  ];

  // Helper function to migrate old data format
  const migrateCommoditiesData = (commodities: any[]): Commodity[] => {
    return commodities.map(commodity => ({
      ...commodity,
      varieties: commodity.varieties.map((variety: any) => ({
        ...variety,
        // If daysToHarvest is still an object, convert it to number
        daysToHarvest: typeof variety.daysToHarvest === 'object' && variety.daysToHarvest !== null
          ? (Object.values(variety.daysToHarvest as Record<string, number>).find((val: number) => val > 0) || 60) // Use first non-zero value or default to 60
          : (variety.daysToHarvest as number),
        // Ensure proper capitalization of plant types
        plantType: variety.plantType?.toLowerCase() === 'transplant' ? 'Transplant' :
                   variety.plantType?.toLowerCase() === 'direct seed' ? 'Direct Seed' :
                   variety.plantType?.toLowerCase() === 'both' ? 'Both' :
                   variety.plantType || 'Transplant'
      }))
    }));
  };

  // Initialize with saved data or default
  const [commodities, setCommodities] = useState<Commodity[]>(() => {
    const loadedData = persistenceService.load(STORAGE_KEYS.COMMODITIES, defaultCommodities);
    return migrateCommoditiesData(loadedData);
  });

  // Auto-save commodities when they change
  useEffect(() => {
    persistenceService.save(STORAGE_KEYS.COMMODITIES, commodities);
  }, [commodities]);

  const addVariety = (commodityName: string, varietyData: Partial<Variety>) => {
    const varietyWithId: Variety = { 
      id: Date.now(),
      name: varietyData.name || '',
      growingWindow: varietyData.growingWindow || { start: '', end: '' },
      daysToHarvest: varietyData.daysToHarvest || 0,
      bedSize: varietyData.bedSize || '',
      spacing: varietyData.spacing || '',
      plantType: varietyData.plantType || '',
      idealStand: varietyData.idealStand || 0,
      marketTypes: varietyData.marketTypes || [],
      budgetYieldPerAcre: varietyData.budgetYieldPerAcre || {},
      preferences: varietyData.preferences || {}
    };
    
    setCommodities((prev) => prev.map((c) => 
      c.name === commodityName 
        ? { ...c, varieties: [...c.varieties, varietyWithId] }
        : c
    ));
  };

  const updateVariety = (commodityName: string, varietyId: number, varietyData: Partial<Variety>) => {
    setCommodities((prev) => prev.map((c) => 
      c.name === commodityName 
        ? { 
            ...c, 
            varieties: c.varieties.map((v) => 
              v.id === varietyId ? { ...v, ...varietyData, id: varietyId } : v
            )
          }
        : c
    ));
  };

  const deleteVariety = (commodityName: string, varietyId: number) => {
    setCommodities((prev) => prev.map((c) => 
      c.name === commodityName 
        ? { ...c, varieties: c.varieties.filter((v) => v.id !== varietyId) }
        : c
    ));
  };

  const addCommodity = (commodityData: Partial<Commodity>) => {
    const commodityWithId: Commodity = {
      id: Date.now(),
      name: commodityData.name || '',
      varieties: commodityData.varieties || []
    };
    
    setCommodities((prev) => [...prev, commodityWithId]);
  };

  const updateCommodity = (commodityId: number, commodityData: Partial<Commodity>) => {
    setCommodities((prev) => prev.map((c) => 
      c.id === commodityId 
        ? { ...c, ...commodityData, id: commodityId }
        : c
    ));
  };

  const deleteCommodity = (commodityId: number) => {
    setCommodities((prev) => prev.filter((c) => c.id !== commodityId));
  };

  const duplicateVariety = (commodityName: string, varietyId: number) => {
    const commodity = commodities.find(c => c.name === commodityName);
    const variety = commodity?.varieties.find(v => v.id === varietyId);
    
    if (variety) {
      const duplicatedVariety: Variety = {
        ...variety,
        id: Date.now(),
        name: `${variety.name} (Copy)`
      };
      
      setCommodities((prev) => prev.map((c) => 
        c.name === commodityName 
          ? { ...c, varieties: [...c.varieties, duplicatedVariety] }
          : c
      ));
    }
  };

  return { 
    commodities, 
    addCommodity,
    updateCommodity,
    deleteCommodity,
    addVariety, 
    updateVariety, 
    deleteVariety,
    duplicateVariety
  };
};
