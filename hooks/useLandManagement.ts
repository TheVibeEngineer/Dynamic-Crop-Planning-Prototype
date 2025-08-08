// =============================================================================
// USE LAND MANAGEMENT HOOK - Land structure state management
// =============================================================================

import { useState, useEffect } from 'react';
import type { Region, Ranch, Lot, LandManagementActions } from '@/types';
import { persistenceService } from '@/lib/services/persistence';
import { STORAGE_KEYS } from '@/lib/constants';

export const useLandManagement = (
  plantings?: any[],
  unassignPlanting?: (plantingId: string) => void
): LandManagementActions & { 
  landStructure: Region[];
  setLandStructure: React.Dispatch<React.SetStateAction<Region[]>>;
} => {
  // Default land structure data
  const defaultLandStructure: Region[] = [
    {
      id: 1, region: 'Salinas',
      ranches: [
        {
          id: 1, name: 'North Ranch',
          lots: [
            { id: 1, number: '1', acres: 25, soilType: 'Sandy Loam', lastCrop: 'Lettuce', lastPlantDate: '2024-08-15', microclimate: 'Cool' },
            { id: 2, number: '2', acres: 30, soilType: 'Clay Loam', lastCrop: 'Carrots', lastPlantDate: '2024-06-01', microclimate: 'Cool' },
            { id: 3, number: '3', acres: 20, soilType: 'Sandy Loam', lastCrop: 'Broccoli', lastPlantDate: '2024-07-10', microclimate: 'Moderate' }
          ]
        },
        {
          id: 2, name: 'South Ranch',
          lots: [
            { id: 4, number: '1', acres: 35, soilType: 'Clay Loam', lastCrop: 'Spinach', lastPlantDate: '2024-05-20', microclimate: 'Warm' },
            { id: 5, number: '2', acres: 28, soilType: 'Sandy Loam', lastCrop: 'Lettuce', lastPlantDate: '2024-09-01', microclimate: 'Warm' }
          ]
        }
      ]
    },
    {
      id: 2, region: 'Yuma',
      ranches: [
        {
          id: 3, name: 'Desert Ranch',
          lots: [
            { id: 6, number: '1', acres: 40, soilType: 'Sandy', lastCrop: 'Cauliflower', lastPlantDate: '2024-11-15', microclimate: 'Hot' },
            { id: 7, number: '2', acres: 32, soilType: 'Sandy', lastCrop: 'Cabbage', lastPlantDate: '2024-12-01', microclimate: 'Hot' }
          ]
        }
      ]
    }
  ];

  // Initialize with saved data or default
  const [landStructure, setLandStructure] = useState<Region[]>(() => {
    return persistenceService.load(STORAGE_KEYS.LAND_STRUCTURE, defaultLandStructure);
  });

  // Auto-save land structure when it changes
  useEffect(() => {
    persistenceService.save(STORAGE_KEYS.LAND_STRUCTURE, landStructure);
  }, [landStructure]);

  const addRegion = (regionData: Partial<Region>) => {
    const newRegion: Region = {
      id: Date.now(),
      region: regionData.region || '',
      ranches: []
    };
    setLandStructure((prev) => [...prev, newRegion]);
  };

  const updateRegion = (regionId: number, regionData: Partial<Region>) => {
    setLandStructure((prev) => prev.map((region) =>
      region.id === regionId ? { ...region, ...regionData } : region
    ));
  };

  const deleteRegion = (regionId: number) => {
    // Unassign all plantings in this region
    if (plantings && unassignPlanting) {
      const plantingsToUnassign = plantings.filter(
        (p: any) => p.assigned && p.assignedLot?.regionId === regionId
      );
      plantingsToUnassign.forEach((p: any) => unassignPlanting(p.id));
    }
    
    setLandStructure((prev) => prev.filter((region) => region.id !== regionId));
  };

  const addRanch = (regionId: number, ranchData: Partial<Ranch>) => {
    const newRanch: Ranch = {
      id: Date.now(),
      name: ranchData.name || '',
      lots: []
    };
    setLandStructure((prev) => prev.map((region) =>
      region.id === regionId
        ? { ...region, ranches: [...region.ranches, newRanch] }
        : region
    ));
  };

  const updateRanch = (regionId: number, ranchId: number, ranchData: Partial<Ranch>) => {
    setLandStructure((prev) => prev.map((region) =>
      region.id === regionId
        ? {
            ...region,
            ranches: region.ranches.map((ranch) =>
              ranch.id === ranchId ? { ...ranch, ...ranchData } : ranch
            )
          }
        : region
    ));
  };

  const deleteRanch = (regionId: number, ranchId: number) => {
    // Unassign all plantings in this ranch
    if (plantings && unassignPlanting) {
      const plantingsToUnassign = plantings.filter(
        (p: any) => p.assigned && p.assignedLot?.regionId === regionId && p.assignedLot?.ranchId === ranchId
      );
      plantingsToUnassign.forEach((p: any) => unassignPlanting(p.id));
    }
    
    setLandStructure((prev) => prev.map((region) =>
      region.id === regionId
        ? { ...region, ranches: region.ranches.filter((ranch) => ranch.id !== ranchId) }
        : region
    ));
  };

  const addLot = (regionId: number, ranchId: number, lotData: Partial<Lot>) => {
    // Check if lot number already exists in this ranch
    const region = landStructure.find(r => r.id === regionId);
    const ranch = region?.ranches.find(r => r.id === ranchId);
    const existingLot = ranch?.lots.find(l => l.number === lotData.number);
    
    if (existingLot) {
      throw new Error(`Lot number "${lotData.number}" already exists in this ranch. Please choose a different lot number.`);
    }
    
    const newLot: Lot = {
      id: Date.now(),
      number: lotData.number || '',
      acres: parseFloat(lotData.acres?.toString() || '0'),
      soilType: lotData.soilType || '',
      lastCrop: lotData.lastCrop,
      lastPlantDate: lotData.lastPlantDate,
      microclimate: lotData.microclimate || ''
    };
    
    setLandStructure((prev) => prev.map((region) =>
      region.id === regionId
        ? {
            ...region,
            ranches: region.ranches.map((ranch) =>
              ranch.id === ranchId
                ? { ...ranch, lots: [...ranch.lots, newLot] }
                : ranch
            )
          }
        : region
    ));
  };

  const updateLot = (regionId: number, ranchId: number, lotId: number, lotData: Partial<Lot>) => {
    // Check if lot number already exists in this ranch (excluding the current lot being updated)
    if (lotData.number) {
      const region = landStructure.find(r => r.id === regionId);
      const ranch = region?.ranches.find(r => r.id === ranchId);
      const existingLot = ranch?.lots.find(l => l.number === lotData.number && l.id !== lotId);
      
      if (existingLot) {
        throw new Error(`Lot number "${lotData.number}" already exists in this ranch. Please choose a different lot number.`);
      }
    }
    
    setLandStructure((prev) => prev.map((region) =>
      region.id === regionId
        ? {
            ...region,
            ranches: region.ranches.map((ranch) =>
              ranch.id === ranchId
                ? {
                    ...ranch,
                    lots: ranch.lots.map((lot) =>
                      lot.id === lotId
                        ? {
                            ...lot,
                            ...lotData,
                            acres: parseFloat(lotData.acres?.toString() || lot.acres.toString())
                          }
                        : lot
                    )
                  }
                : ranch
            )
          }
        : region
    ));
  };

  const deleteLot = (regionId: number, ranchId: number, lotId: number) => {
    // Unassign all plantings in this lot
    if (plantings && unassignPlanting) {
      const plantingsToUnassign = plantings.filter(
        (p: any) => p.assigned && p.assignedLot?.regionId === regionId && 
                    p.assignedLot?.ranchId === ranchId && p.assignedLot?.lotId === lotId
      );
      plantingsToUnassign.forEach((p: any) => unassignPlanting(p.id));
    }
    
    setLandStructure((prev) => prev.map((region) =>
      region.id === regionId
        ? {
            ...region,
            ranches: region.ranches.map((ranch) =>
              ranch.id === ranchId
                ? { ...ranch, lots: ranch.lots.filter((lot) => lot.id !== lotId) }
                : ranch
            )
          }
        : region
    ));
  };

  const findLot = (regionId: number, ranchId: number, lotId: number) => {
    const region = landStructure.find((r) => r.id === regionId);
    const ranch = region?.ranches.find((r) => r.id === ranchId);
    const lot = ranch?.lots.find((l) => l.id === lotId);
    return lot;
  };

  return { 
    landStructure, 
    setLandStructure, 
    addRegion,
    updateRegion,
    deleteRegion,
    addRanch, 
    updateRanch, 
    deleteRanch,
    addLot,
    updateLot,
    deleteLot,
    findLot 
  };
};
