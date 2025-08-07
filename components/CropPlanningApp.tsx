'use client'

import React, { useState, useEffect } from 'react';
import { Calendar, Download, AlertTriangle, CheckCircle, Scissors } from 'lucide-react';

// =============================================================================
// SERVICES - Business Logic Layer
// =============================================================================

const plantingService = {
  generateFromOrders: (orders, commodities) => {
    const plantings = [];
    let plantingId = 1;
    
    orders.forEach(order => {
      const commodity = commodities.find(c => c.name === order.commodity);
      
      if (commodity) {
        const suitableVarieties = commodity.varieties.filter(v => 
          v.marketTypes.includes(order.marketType) && 
          v.budgetYieldPerAcre[order.marketType] > 0
        );
        
        if (suitableVarieties.length > 0) {
          const variety = suitableVarieties[0];
          const yieldPerAcre = variety.budgetYieldPerAcre[order.marketType];
          const acresNeeded = Math.ceil(order.volume / yieldPerAcre * 100) / 100;
          
          const deliveryDate = new Date(order.deliveryDate);
          const plantingDate = new Date(deliveryDate);
          plantingDate.setDate(plantingDate.getDate() - variety.daysToHarvest);
          
          const basePlanting = {
            id: plantingId++,
            customer: order.customer,
            region: '',
            ranch: '',
            lot: '',
            sublot: '',
            displayLotId: '',
            marketType: order.marketType,
            crop: commodity.name,
            variety: variety.name,
            volumeOrdered: order.volume,
            acres: acresNeeded,
            wetDate: plantingDate.toISOString().split('T')[0],
            budgetedDaysToHarvest: variety.daysToHarvest,
            bedSize: variety.bedSize,
            spacing: variety.spacing,
            budgetedHarvestDate: order.deliveryDate,
            idealStandPerAcre: variety.idealStand,
            budgetYieldPerAcre: yieldPerAcre,
            totalYield: Math.round(acresNeeded * yieldPerAcre),
            assigned: false,
            parentPlantingId: null
          };
          
          plantings.push(basePlanting);
          
          if (order.isWeekly) {
            for (let week = 1; week < 12; week++) {
              const weeklyDeliveryDate = new Date(deliveryDate);
              weeklyDeliveryDate.setDate(weeklyDeliveryDate.getDate() + (week * 7));
              
              const weeklyPlantingDate = new Date(weeklyDeliveryDate);
              weeklyPlantingDate.setDate(weeklyPlantingDate.getDate() - variety.daysToHarvest);
              
              plantings.push({
                ...basePlanting,
                id: plantingId++,
                wetDate: weeklyPlantingDate.toISOString().split('T')[0],
                budgetedHarvestDate: weeklyDeliveryDate.toISOString().split('T')[0],
                assigned: false
              });
            }
          }
        }
      }
    });
    
    return plantings;
  },
  
  assignToLot: (planting, region, ranch, lot, sublot = 'A') => {
    const uniqueLotId = `${region.id}-${ranch.id}-${lot.id}`;
    const displayLotId = `${lot.number}-${sublot}`;
    
    return {
      ...planting,
      region: region.region,
      ranch: ranch.name,
      lot: lot.number,
      sublot: sublot,
      displayLotId: displayLotId,
      uniqueLotId,
      assigned: true
    };
  },

  splitPlanting: (originalPlanting, maxAcres) => {
    const remainingAcres = Math.round((originalPlanting.acres - maxAcres) * 100) / 100;
    const acreRatio = maxAcres / originalPlanting.acres;
    
    const assignedVolume = Math.round(originalPlanting.volumeOrdered * acreRatio);
    const remainingVolume = originalPlanting.volumeOrdered - assignedVolume;
    
    const assignedTotalYield = Math.round(maxAcres * originalPlanting.budgetYieldPerAcre);
    const remainingTotalYield = Math.round(remainingAcres * originalPlanting.budgetYieldPerAcre);
    
    const assignedPortion = {
      ...originalPlanting,
      id: Date.now() + Math.random(),
      acres: maxAcres,
      volumeOrdered: assignedVolume,
      totalYield: assignedTotalYield,
      parentPlantingId: originalPlanting.id
    };
    
    const unassignedRemainder = {
      ...originalPlanting,
      id: Date.now() + Math.random() + 1,
      acres: remainingAcres,
      volumeOrdered: remainingVolume,
      totalYield: remainingTotalYield,
      assigned: false,
      region: '',
      ranch: '',
      lot: '',
      sublot: '',
      displayLotId: '',
      uniqueLotId: '',
      parentPlantingId: originalPlanting.id
    };
    
    return { assignedPortion, unassignedRemainder };
  }
};

const capacityService = {
  calculateLotCapacity: (regionId, ranchId, lotId, landStructure, plantings) => {
    const region = landStructure.find(r => r.id === regionId);
    const ranch = region?.ranches.find(r => r.id === ranchId);
    const lot = ranch?.lots.find(l => l.id === lotId);
    
    if (!lot) {
      return { totalAcres: 0, usedAcres: 0, availableAcres: 0, plantingCount: 0, plantings: [] };
    }
    
    const lotPlantings = plantings.filter(p => 
      p.assigned && p.uniqueLotId === `${regionId}-${ranchId}-${lotId}`
    );
    
    const usedAcres = lotPlantings.reduce((total, p) => total + parseFloat(p.acres), 0);
    const availableAcres = Math.max(0, lot.acres - usedAcres);
    
    return {
      totalAcres: lot.acres,
      usedAcres: Math.round(usedAcres * 100) / 100,
      availableAcres: Math.round(availableAcres * 100) / 100,
      plantingCount: lotPlantings.length,
      plantings: lotPlantings
    };
  },
  
  getNextSublotDesignation: (regionId, ranchId, lotId, plantings) => {
    const lotPlantings = plantings.filter(p => 
      p.assigned && p.uniqueLotId === `${regionId}-${ranchId}-${lotId}`
    );
    
    const usedSublots = lotPlantings.map(p => p.sublot).filter(Boolean);
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let i = 0; i < alphabet.length; i++) {
      if (!usedSublots.includes(alphabet[i])) {
        return alphabet[i];
      }
    }
    
    return 'A';
  },
  
  canFitInLot: (plantingAcres, regionId, ranchId, lotId, landStructure, plantings) => {
    const capacity = capacityService.calculateLotCapacity(regionId, ranchId, lotId, landStructure, plantings);
    return {
      canFit: plantingAcres <= capacity.availableAcres,
      availableAcres: capacity.availableAcres,
      wouldExceedBy: Math.max(0, plantingAcres - capacity.availableAcres),
      willRequireSplit: plantingAcres > capacity.availableAcres && capacity.availableAcres > 0
    };
  }
};

const csvService = {
  exportPlantings: (plantings) => {
    try {
      const headers = ['Customer', 'Region', 'Ranch', 'Lot', 'Sublot', 'Full Lot ID', 'Market Type', 'Crop', 'Variety', 'Volume Ordered', 'Acres', 'Wet Date', 'Budgeted Days to Harvest', 'Bed Size', 'Spacing', 'Budgeted Harvest Date', 'Ideal Stand / Acre', 'Budget Yield / Acre', 'Total Yield'];
      
      const rows = plantings.map(p => [
        p.customer || '', 
        p.region || '', 
        p.ranch || '', 
        p.lot || '', 
        p.sublot || '',
        p.displayLotId || '',
        p.marketType || '', 
        p.crop || '', 
        p.variety || '', 
        p.volumeOrdered ? `${p.volumeOrdered} ${p.marketType === 'Fresh Cut' ? 'cartons' : 'lbs'}` : '',
        p.acres || '', 
        p.wetDate || '', 
        p.budgetedDaysToHarvest || '', 
        p.bedSize || '', 
        p.spacing || '', 
        p.budgetedHarvestDate || '', 
        p.idealStandPerAcre || '', 
        p.budgetYieldPerAcre ? `${p.budgetYieldPerAcre} ${p.marketType === 'Fresh Cut' ? 'cartons' : 'lbs'}/acre` : '',
        p.totalYield ? `${p.totalYield} ${p.marketType === 'Fresh Cut' ? 'cartons' : 'lbs'}` : ''
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'crop-plan.csv';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('CSV export failed:', error);
      alert(`CSV export failed: ${error.message}`);
    }
  }
};

// =============================================================================
// PERSISTENCE UTILITIES - Data Storage Layer
// =============================================================================

const persistenceService = {
  // Save data to localStorage with error handling
  save: (key: string, data: any) => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') return false;
      
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn(`Failed to save ${key} to localStorage:`, error);
      return false;
    }
  },

  // Load data from localStorage with validation
  load: (key: string, defaultValue: any = null) => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') return defaultValue;
      
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;
      
      const parsed = JSON.parse(stored);
      return parsed;
    } catch (error) {
      console.warn(`Failed to load ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  // Clear specific data
  clear: (key: string) => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') return false;
      
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to clear ${key} from localStorage:`, error);
      return false;
    }
  },

  // Clear all app data
  clearAll: () => {
    const keys = ['cropPlanning_orders', 'cropPlanning_commodities', 'cropPlanning_landStructure', 
                  'cropPlanning_plantings', 'cropPlanning_activeTab'];
    keys.forEach(key => persistenceService.clear(key));
  }
};

// =============================================================================
// CUSTOM HOOKS - State Management Layer  
// =============================================================================

const useOrders = () => {
  // Default orders data
  const defaultOrders = [
    { id: 1, customer: 'Fresh Farms Co', commodity: 'Romaine', volume: 10000, marketType: 'Fresh Cut', deliveryDate: '2025-09-15', isWeekly: false },
    { id: 2, customer: 'Valley Produce', commodity: 'Carrots', volume: 50000, marketType: 'Bulk', deliveryDate: '2025-10-01', isWeekly: true },
    { id: 3, customer: 'Premium Greens', commodity: 'Iceberg', volume: 7500, marketType: 'Fresh Cut', deliveryDate: '2025-08-20', isWeekly: false },
    { id: 4, customer: 'Green Valley Co', commodity: 'Romaine', volume: 8000, marketType: 'Fresh Cut', deliveryDate: '2025-08-30', isWeekly: false },
    { id: 5, customer: 'Desert Fresh', commodity: 'Carrots', volume: 30000, marketType: 'Bulk', deliveryDate: '2025-11-15', isWeekly: false },
    { id: 6, customer: 'Coastal Greens', commodity: 'Iceberg', volume: 12000, marketType: 'Fresh Cut', deliveryDate: '2025-09-01', isWeekly: false }
  ];

  // Initialize with saved data or default
  const [orders, setOrders] = useState(() => {
    return persistenceService.load('cropPlanning_orders', defaultOrders);
  });

  // Auto-save orders when they change
  useEffect(() => {
    persistenceService.save('cropPlanning_orders', orders);
  }, [orders]);

  const addOrder = (orderData) => {
    const order = {
      id: Date.now(),
      ...orderData,
      volume: parseFloat(orderData.volume)
    };
    setOrders(prev => [...prev, order]);
  };

  const updateOrder = (id, orderData) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...orderData, id, volume: parseFloat(orderData.volume) } : order
    ));
  };

  const deleteOrder = (id) => {
    setOrders(prev => prev.filter(order => order.id !== id));
  };

  return { orders, addOrder, updateOrder, deleteOrder };
};

const useCommodities = () => {
  // Default commodities data
  const defaultCommodities = [
    {
      id: 1,
      name: 'Romaine',
      varieties: [
        { 
          id: 1, name: 'Green Forest', growingWindow: { start: 'Mar', end: 'Nov' }, daysToHarvest: 60,
          bedSize: '38-2', spacing: '12in', plantType: 'transplant', idealStand: 30000,
          marketTypes: ['Fresh Cut'], budgetYieldPerAcre: { 'Fresh Cut': 1200, 'Bulk': 0 },
          preferences: { Jan: 0, Feb: 0, Mar: 10, Apr: 15, May: 20, Jun: 20, Jul: 15, Aug: 10, Sep: 5, Oct: 5, Nov: 0, Dec: 0 }
        },
        { 
          id: 2, name: 'Parris Island Cos', growingWindow: { start: 'Apr', end: 'Oct' }, daysToHarvest: 58,
          bedSize: '38-2', spacing: '12in', plantType: 'transplant', idealStand: 32000,
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
          bedSize: '38-2', spacing: '12in', plantType: 'transplant', idealStand: 28000,
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
          bedSize: '38-2', spacing: '2in', plantType: 'direct seed', idealStand: 500000,
          marketTypes: ['Bulk'], budgetYieldPerAcre: { 'Fresh Cut': 0, 'Bulk': 45000 },
          preferences: { Jan: 0, Feb: 10, Mar: 15, Apr: 15, May: 15, Jun: 15, Jul: 15, Aug: 10, Sep: 5, Oct: 0, Nov: 0, Dec: 0 }
        }
      ]
    }
  ];

  // Initialize with saved data or default
  const [commodities, setCommodities] = useState(() => {
    return persistenceService.load('cropPlanning_commodities', defaultCommodities);
  });

  // Auto-save commodities when they change
  useEffect(() => {
    persistenceService.save('cropPlanning_commodities', commodities);
  }, [commodities]);

  const addVariety = (commodityId, varietyData) => {
    const varietyWithId = { ...varietyData, id: Date.now() };
    setCommodities(prev => prev.map(c => 
      c.id === commodityId 
        ? { ...c, varieties: [...c.varieties, varietyWithId] }
        : c
    ));
  };

  const updateVariety = (commodityId, varietyId, varietyData) => {
    setCommodities(prev => prev.map(c => 
      c.id === commodityId 
        ? { 
            ...c, 
            varieties: c.varieties.map(v => 
              v.id === varietyId ? { ...varietyData, id: varietyId } : v
            )
          }
        : c
    ));
  };

  const deleteVariety = (commodityId, varietyId) => {
    setCommodities(prev => prev.map(c => 
      c.id === commodityId 
        ? { ...c, varieties: c.varieties.filter(v => v.id !== varietyId) }
        : c
    ));
  };

  return { commodities, addVariety, updateVariety, deleteVariety };
};

const useLandManagement = () => {
  // Default land structure data
  const defaultLandStructure = [
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
  const [landStructure, setLandStructure] = useState(() => {
    return persistenceService.load('cropPlanning_landStructure', defaultLandStructure);
  });

  // Auto-save land structure when it changes
  useEffect(() => {
    persistenceService.save('cropPlanning_landStructure', landStructure);
  }, [landStructure]);

  const findLot = (regionId, ranchId, lotId) => {
    const region = landStructure.find(r => r.id === regionId);
    const ranch = region?.ranches.find(r => r.id === ranchId);
    const lot = ranch?.lots.find(l => l.id === lotId);
    return { region, ranch, lot };
  };

  return { 
    landStructure, 
    setLandStructure, 
    findLot 
  };
};

const usePlantings = (orders, commodities, landStructure) => {
  // Initialize with saved data or empty array
  const [plantings, setPlantings] = useState(() => {
    return persistenceService.load('cropPlanning_plantings', []);
  });

  // Auto-save plantings when they change
  useEffect(() => {
    persistenceService.save('cropPlanning_plantings', plantings);
  }, [plantings]);

  const generatePlantings = () => {
    const newPlantings = plantingService.generateFromOrders(orders, commodities);
    setPlantings(newPlantings);
  };

  const assignPlantingToLot = (plantingId, region, ranch, lot, onSplitNotification) => {
    const planting = plantings.find(p => p.id === plantingId);
    
    const fitCheck = capacityService.canFitInLot(
      planting.acres, 
      region.id, 
      ranch.id, 
      lot.id, 
      landStructure, 
      plantings
    );
    
    if (fitCheck.canFit) {
      const sublot = capacityService.getNextSublotDesignation(region.id, ranch.id, lot.id, plantings);
      const updatedPlanting = plantingService.assignToLot(planting, region, ranch, lot, sublot);
      
      setPlantings(prev => prev.map(p => 
        p.id === plantingId ? updatedPlanting : p
      ));
      
      return { success: true, type: 'assigned' };
      
    } else if (fitCheck.availableAcres > 0) {
      const { assignedPortion, unassignedRemainder } = plantingService.splitPlanting(
        planting, 
        fitCheck.availableAcres
      );
      
      const sublot = capacityService.getNextSublotDesignation(region.id, ranch.id, lot.id, plantings);
      const assignedWithLocation = plantingService.assignToLot(assignedPortion, region, ranch, lot, sublot);
      
      setPlantings(prev => [
        ...prev.filter(p => p.id !== plantingId),
        assignedWithLocation,
        unassignedRemainder
      ]);
      
      if (onSplitNotification) {
        onSplitNotification({
          originalPlanting: planting,
          assignedPortion: assignedWithLocation,
          unassignedRemainder: unassignedRemainder,
          lot: lot,
          splitReason: 'capacity'
        });
      }
      
      return { 
        success: true, 
        type: 'split',
        assignedAcres: assignedWithLocation.acres,
        remainingAcres: unassignedRemainder.acres
      };
      
    } else {
      return { 
        success: false, 
        type: 'no_capacity',
        message: `Lot ${lot.number} is at full capacity (${lot.acres} acres used)`
      };
    }
  };

  return { plantings, generatePlantings, assignPlantingToLot };
};

const useSplitNotifications = () => {
  const [splitNotification, setSplitNotification] = useState(null);

  const showSplitNotification = (notification) => {
    setSplitNotification(notification);
  };

  const clearSplitNotification = () => {
    setSplitNotification(null);
  };

  return { splitNotification, showSplitNotification, clearSplitNotification };
};

const useDragAndDrop = (assignPlantingToLot, findLot, landStructure, plantings, showSplitNotification) => {
  const [draggedPlanting, setDraggedPlanting] = useState(null);

  const handleDragStart = (e, planting) => {
    setDraggedPlanting(planting);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, regionId, ranchId, lotId) => {
    e.preventDefault();
    if (draggedPlanting) {
      const { region, ranch, lot } = findLot(regionId, ranchId, lotId);
      if (region && ranch && lot) {
        const result = assignPlantingToLot(
          draggedPlanting.id, 
          region, 
          ranch, 
          lot,
          showSplitNotification
        );
        
        if (!result.success && result.type === 'no_capacity') {
          alert(result.message);
        }
      }
      setDraggedPlanting(null);
    }
  };

  return { draggedPlanting, handleDragStart, handleDragOver, handleDrop };
};

// =============================================================================
// SHARED COMPONENTS - Reusable UI Layer
// =============================================================================

const Modal = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
        <div className="flex justify-end space-x-2 mt-6">{actions}</div>
      </div>
    </div>
  );
};

const SplitNotificationModal = ({ notification, onClose }) => {
  if (!notification) return null;

  const { originalPlanting, assignedPortion, unassignedRemainder, lot } = notification;

  return (
    <Modal 
      isOpen={!!notification} 
      onClose={onClose} 
      title="Planting Split Successfully"
      actions={[
        <Button key="ok" onClick={onClose}>
          Got it!
        </Button>
      ]}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <Scissors className="text-blue-600" size={24} />
          <div>
            <div className="font-medium text-blue-900">
              Planting was automatically split due to lot capacity
            </div>
            <div className="text-sm text-blue-700">
              {originalPlanting.acres} acres didn't fit in Lot {lot.number} ({lot.acres} acre capacity)
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-800 mb-2">Original Planting:</div>
          <div className="text-sm text-gray-600">
            <div><strong>{originalPlanting.customer}</strong> - {originalPlanting.crop} ({originalPlanting.variety})</div>
            <div>{originalPlanting.volumeOrdered?.toLocaleString()} {originalPlanting.marketType === 'Fresh Cut' ? 'cartons' : 'lbs'} • {originalPlanting.acres} acres</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-green-600" size={16} />
              <span className="font-medium text-green-800">✅ Assigned</span>
            </div>
            <div className="text-sm text-green-700">
              <div><strong>{assignedPortion.acres} acres</strong> → Lot {assignedPortion.displayLotId}</div>
              <div>{assignedPortion.volumeOrdered?.toLocaleString()} {assignedPortion.marketType === 'Fresh Cut' ? 'cartons' : 'lbs'}</div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-yellow-600" size={16} />
              <span className="font-medium text-yellow-800">📋 Remaining</span>
            </div>
            <div className="text-sm text-yellow-700">
              <div><strong>{unassignedRemainder.acres} acres</strong> (unassigned)</div>
              <div>{unassignedRemainder.volumeOrdered?.toLocaleString()} {unassignedRemainder.marketType === 'Fresh Cut' ? 'cartons' : 'lbs'}</div>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <strong>💡 Tip:</strong> The remaining {unassignedRemainder.acres} acres will appear in the unassigned plantings list. 
          You can drag it to another lot with sufficient capacity.
        </div>
      </div>
    </Modal>
  );
};

const Button = ({ variant = 'primary', size = 'md', children, className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center gap-2 rounded-lg font-medium transition-colors';
  const variantClasses = {
    primary: 'text-white hover:bg-opacity-90',
    secondary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    danger: 'text-red-600 hover:text-red-900',
    success: 'bg-green-600 text-white hover:bg-green-700',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700'
  };
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const style = variant === 'primary' ? { backgroundColor: '#0f3e62' } : {};

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
};

const DataTable = ({ headers, data, renderRow }) => (
  <div className="bg-white shadow-sm rounded-lg overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((header, index) => (
            <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((item, index) => renderRow(item, index))}
      </tbody>
    </table>
  </div>
);

const Navigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'orders', name: 'Orders', icon: '📋' },
    { id: 'commodities', name: 'Commodities & Varieties', icon: '🌱' },
    { id: 'land', name: 'Land Management', icon: '🗺️' },
    { id: 'gantt', name: 'Timeline View', icon: '📅' },
    { id: 'planning', name: 'Crop Planning', icon: '📊' },
    { id: 'data', name: 'Data Management', icon: '💾' }
  ];

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? '' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={activeTab === tab.id ? { borderColor: '#0f3e62', color: '#0f3e62' } : {}}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

// =============================================================================
// FEATURE COMPONENTS - Domain-Specific Features
// =============================================================================

const OrdersFeature = ({ orders, onAddOrder, onUpdateOrder, onDeleteOrder, commodities }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    customer: '', commodity: '', volume: '', marketType: 'Fresh Cut', deliveryDate: '', isWeekly: false
  });

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      customer: order.customer,
      commodity: order.commodity,
      volume: order.volume.toString(),
      marketType: order.marketType,
      deliveryDate: order.deliveryDate,
      isWeekly: order.isWeekly
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (formData.customer && formData.commodity && formData.volume && formData.deliveryDate) {
      if (editingOrder) {
        onUpdateOrder(editingOrder.id, formData);
      } else {
        onAddOrder(formData);
      }
      setFormData({ customer: '', commodity: '', volume: '', marketType: 'Fresh Cut', deliveryDate: '', isWeekly: false });
      setEditingOrder(null);
      setShowForm(false);
    }
  };

  const headers = ['Customer', 'Commodity', 'Market Type', 'Volume', 'Delivery Date', 'Type', 'Actions'];

  const renderRow = (order) => (
    <tr key={order.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.customer}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.commodity}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          order.marketType === 'Fresh Cut' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {order.marketType}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {order.volume.toLocaleString()} {order.marketType === 'Fresh Cut' ? 'cartons' : 'lbs'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.deliveryDate}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          order.isWeekly ? 'text-white' : 'bg-gray-100 text-gray-800'
        }`}
        style={order.isWeekly ? { backgroundColor: '#2563eb' } : {}}
        >
          {order.isWeekly ? 'Weekly' : 'One-time'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex gap-2">
          <button onClick={() => handleEdit(order)} className="transition-colors" style={{ color: '#0f3e62' }}>
            Edit
          </button>
          <button onClick={() => onDeleteOrder(order.id)} className="text-red-600 hover:text-red-900">
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Customer Orders</h2>
        <Button onClick={() => setShowForm(true)}>Add Order</Button>
      </div>

      <DataTable headers={headers} data={orders} renderRow={renderRow} />

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingOrder(null); }}
        title={editingOrder ? 'Edit Order' : 'Add New Order'}
        actions={[
          <Button key="cancel" variant="outline" onClick={() => { setShowForm(false); setEditingOrder(null); }}>
            Cancel
          </Button>,
          <Button key="submit" onClick={handleSubmit}>
            {editingOrder ? 'Update Order' : 'Add Order'}
          </Button>
        ]}
      >
        <input
          type="text"
          placeholder="Customer Name"
          value={formData.customer}
          onChange={(e) => setFormData({...formData, customer: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
        <select
          value={formData.commodity}
          onChange={(e) => setFormData({...formData, commodity: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          <option value="">Select Commodity</option>
          {commodities.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <select
          value={formData.marketType}
          onChange={(e) => setFormData({...formData, marketType: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          <option value="Fresh Cut">Fresh Cut</option>
          <option value="Bulk">Bulk</option>
        </select>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={`Volume (${formData.marketType === 'Fresh Cut' ? 'cartons' : 'lbs'})`}
            value={formData.volume}
            onChange={(e) => setFormData({...formData, volume: e.target.value})}
            className="flex-1 p-2 border border-gray-300 rounded-lg"
          />
          <div className="flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
            {formData.marketType === 'Fresh Cut' ? 'cartons' : 'lbs'}
          </div>
        </div>
        <input
          type="date"
          value={formData.deliveryDate}
          onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isWeekly}
            onChange={(e) => setFormData({...formData, isWeekly: e.target.checked})}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Weekly recurring order</span>
        </label>
      </Modal>
    </div>
  );
};

const CommoditiesFeature = ({ commodities, onAddVariety, onUpdateVariety, onDeleteVariety }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingVariety, setEditingVariety] = useState(null);
  const [editingCommodityId, setEditingCommodityId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', growingWindow: { start: 'Jan', end: 'Dec' }, daysToHarvest: 60, bedSize: '38-2', spacing: '12in',
    plantType: 'transplant', idealStand: 30000, marketTypes: ['Fresh Cut'],
    budgetYieldPerAcre: { 'Fresh Cut': 1000, 'Bulk': 0 },
    preferences: { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0 }
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const handleAddVariety = (commodityId) => {
    setEditingCommodityId(commodityId);
    setEditingVariety(null);
    setFormData({
      name: '', growingWindow: { start: 'Jan', end: 'Dec' }, daysToHarvest: 60, bedSize: '38-2', spacing: '12in',
      plantType: 'transplant', idealStand: 30000, marketTypes: ['Fresh Cut'],
      budgetYieldPerAcre: { 'Fresh Cut': 1000, 'Bulk': 0 },
      preferences: { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0 }
    });
    setShowForm(true);
  };

  const handleEditVariety = (commodityId, variety) => {
    setEditingCommodityId(commodityId);
    setEditingVariety(variety);
    setFormData({ ...variety });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (formData.name && editingCommodityId) {
      if (editingVariety) {
        onUpdateVariety(editingCommodityId, editingVariety.id, formData);
      } else {
        onAddVariety(editingCommodityId, formData);
      }
      setShowForm(false);
      setEditingVariety(null);
      setEditingCommodityId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Commodities & Varieties</h2>

      <div className="space-y-4">
        {commodities.map(commodity => (
          <div key={commodity.id} className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{commodity.name}</h3>
              <Button variant="secondary" size="sm" onClick={() => handleAddVariety(commodity.id)}>
                Add Variety
              </Button>
            </div>
            
            {commodity.varieties.map((variety) => (
              <div key={variety.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-gray-800">{variety.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      variety.plantType === 'transplant' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {variety.plantType}
                    </span>
                    <div className="flex gap-1">
                      {variety.marketTypes.map(marketType => (
                        <span key={marketType} className={`px-2 py-1 text-xs rounded-full ${
                          marketType === 'Fresh Cut' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {marketType}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditVariety(commodity.id, variety)}
                      className="p-1 transition-colors"
                      style={{ color: '#0f3e62' }}
                    >
                      Edit
                    </button>
                    {commodity.varieties.length > 1 && (
                      <button
                        onClick={() => onDeleteVariety(commodity.id, variety.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Growing Window:</span>
                    <div className="font-medium">{variety.growingWindow.start} - {variety.growingWindow.end}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Days to Harvest:</span>
                    <div className="font-medium">{variety.daysToHarvest} days</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Bed Size:</span>
                    <div className="font-medium">{variety.bedSize}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Ideal Stand/Acre:</span>
                    <div className="font-medium">{variety.idealStand.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  {variety.marketTypes.includes('Fresh Cut') && variety.budgetYieldPerAcre['Fresh Cut'] > 0 && (
                    <div>
                      <span className="text-gray-500">Fresh Cut Yield:</span>
                      <div className="font-medium">{variety.budgetYieldPerAcre['Fresh Cut'].toLocaleString()} cartons/acre</div>
                    </div>
                  )}
                  {variety.marketTypes.includes('Bulk') && variety.budgetYieldPerAcre['Bulk'] > 0 && (
                    <div>
                      <span className="text-gray-500">Bulk Yield:</span>
                      <div className="font-medium">{variety.budgetYieldPerAcre['Bulk'].toLocaleString()} lbs/acre</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingVariety(null); setEditingCommodityId(null); }}
        title={editingVariety ? `Edit Variety: ${editingVariety.name}` : 'Add New Variety'}
        actions={[
          <Button key="cancel" variant="outline" onClick={() => { setShowForm(false); setEditingVariety(null); setEditingCommodityId(null); }}>
            Cancel
          </Button>,
          <Button key="submit" variant="secondary" onClick={handleSubmit}>
            {editingVariety ? 'Update Variety' : 'Add Variety'}
          </Button>
        ]}
      >
        <input
          type="text"
          placeholder="Variety Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <select
            value={formData.growingWindow.start}
            onChange={(e) => setFormData({
              ...formData,
              growingWindow: { ...formData.growingWindow, start: e.target.value }
            })}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <select
            value={formData.growingWindow.end}
            onChange={(e) => setFormData({
              ...formData,
              growingWindow: { ...formData.growingWindow, end: e.target.value }
            })}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Days to Harvest"
            value={formData.daysToHarvest}
            onChange={(e) => setFormData({
              ...formData,
              daysToHarvest: parseInt(e.target.value) || 60
            })}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Ideal Stand per Acre"
            value={formData.idealStand}
            onChange={(e) => setFormData({
              ...formData,
              idealStand: parseInt(e.target.value) || 30000
            })}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-2">Market Types</label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.marketTypes.includes('Fresh Cut')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      marketTypes: [...formData.marketTypes, 'Fresh Cut']
                    });
                  } else {
                    setFormData({
                      ...formData,
                      marketTypes: formData.marketTypes.filter(mt => mt !== 'Fresh Cut')
                    });
                  }
                }}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Fresh Cut</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.marketTypes.includes('Bulk')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      marketTypes: [...formData.marketTypes, 'Bulk']
                    });
                  } else {
                    setFormData({
                      ...formData,
                      marketTypes: formData.marketTypes.filter(mt => mt !== 'Bulk')
                    });
                  }
                }}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Bulk</span>
            </label>
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-2">Budget Yields per Acre</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fresh Cut (cartons/acre)</label>
              <input
                type="number"
                value={formData.budgetYieldPerAcre['Fresh Cut']}
                onChange={(e) => setFormData({
                  ...formData,
                  budgetYieldPerAcre: {
                    ...formData.budgetYieldPerAcre,
                    'Fresh Cut': parseInt(e.target.value) || 0
                  }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg"
                disabled={!formData.marketTypes.includes('Fresh Cut')}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Bulk (lbs/acre)</label>
              <input
                type="number"
                value={formData.budgetYieldPerAcre['Bulk']}
                onChange={(e) => setFormData({
                  ...formData,
                  budgetYieldPerAcre: {
                    ...formData.budgetYieldPerAcre,
                    'Bulk': parseInt(e.target.value) || 0
                  }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg"
                disabled={!formData.marketTypes.includes('Bulk')}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const LandFeature = ({ landStructure, plantings, dragHandlers }) => {
  const { handleDragStart, handleDragOver, handleDrop } = dragHandlers;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Land Management</h2>
        <Button>Add Region</Button>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Land Structure</h3>
          <div className="space-y-4">
            {landStructure.map(region => (
              <div key={region.id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">📍 {region.region} Region</h4>
                
                {region.ranches.map(ranch => (
                  <div key={ranch.id} className="ml-4 mb-3">
                    <h5 className="font-medium text-gray-700 mb-2">🏠 {ranch.name}</h5>
                    
                    {ranch.lots.map(lot => (
                      <div
                        key={lot.id}
                        className="ml-4 p-3 mb-2 border border-gray-300 rounded-lg"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, region.id, ranch.id, lot.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-800">Lot {lot.number}</div>
                            <div className="text-sm text-gray-600">{lot.acres} acres • {lot.soilType}</div>
                            <div className="text-xs text-gray-500">Last: {lot.lastCrop} ({lot.lastPlantDate})</div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            lot.microclimate === 'Cool' ? 'bg-blue-100 text-blue-800' :
                            lot.microclimate === 'Warm' ? 'bg-orange-100 text-orange-800' :
                            lot.microclimate === 'Hot' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {lot.microclimate}
                          </span>
                        </div>
                        
                        {plantings
                          .filter(p => p.assigned && p.lot === lot.number)
                          .map(planting => (
                            <div key={planting.id} className="mt-2 p-2 rounded text-sm text-white" style={{ backgroundColor: '#0f3e62' }}>
                              <div className="font-medium">{planting.crop} - {planting.variety}</div>
                              <div className="opacity-90">{planting.acres} acres • {planting.wetDate}</div>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Unassigned Plantings</h3>
          <div className="space-y-2">
            {plantings
              .filter(p => !p.assigned)
              .map(planting => (
                <div
                  key={planting.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, planting)}
                  className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-move hover:bg-yellow-100 transition-colors"
                >
                  <div className="font-medium text-gray-900">{planting.crop} - {planting.variety}</div>
                  <div className="text-sm text-gray-600">{planting.customer}</div>
                  <div className="text-sm text-gray-500">
                    {planting.volumeOrdered && planting.volumeOrdered.toLocaleString()} {planting.marketType === 'Fresh Cut' ? 'cartons' : 'lbs'} 
                    • {planting.acres} acres • Plant: {planting.wetDate}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const GanttFeature = ({ plantings, landStructure }) => {
  const [timeRange, setTimeRange] = useState('3months');
  const [selectedLots, setSelectedLots] = useState(new Set());

  // Calculate date range for display
  const getDateRange = () => {
    const now = new Date();
    const ranges = {
      '1month': { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0) },
      '3months': { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 3, 0) },
      '6months': { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 6, 0) },
      '1year': { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31) }
    };
    return ranges[timeRange];
  };

  const dateRange = getDateRange();
  const totalDays = Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24));

  // Generate date markers for header
  const generateDateMarkers = () => {
    const markers = [];
    const current = new Date(dateRange.start);
    
    while (current <= dateRange.end) {
      markers.push({
        date: new Date(current),
        label: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isMonth: current.getDate() === 1
      });
      current.setDate(current.getDate() + (timeRange === '1month' ? 1 : timeRange === '3months' ? 3 : 7));
    }
    
    return markers;
  };

  const dateMarkers = generateDateMarkers();

  // Get all unique lots with assigned plantings
  const getAllLots = () => {
    const lots = [];
    const assignedPlantings = plantings.filter(p => p.assigned);
    
    landStructure.forEach(region => {
      region.ranches.forEach(ranch => {
        ranch.lots.forEach(lot => {
          const lotPlantings = assignedPlantings.filter(p => 
            p.region === region.region && p.ranch === ranch.name && p.lot === lot.number
          );
          
          if (lotPlantings.length > 0 || selectedLots.size === 0) {
            lots.push({
              id: `${region.id}-${ranch.id}-${lot.id}`,
              displayName: `${region.region} > ${ranch.name} > Lot ${lot.number}`,
              region: region.region,
              ranch: ranch.name,
              lotNumber: lot.number,
              acres: lot.acres,
              plantings: lotPlantings
            });
          }
        });
      });
    });
    
    return lots.sort((a, b) => a.displayName.localeCompare(b.displayName));
  };

  const allLots = getAllLots();

  // Calculate position and width for planting bars
  const getPlantingBarStyle = (planting) => {
    const startDate = new Date(planting.wetDate);
    const endDate = new Date(planting.budgetedHarvestDate);
    
    // Calculate position as percentage of total range
    const startDays = Math.max(0, (startDate - dateRange.start) / (1000 * 60 * 60 * 24));
    const endDays = Math.min(totalDays, (endDate - dateRange.start) / (1000 * 60 * 60 * 24));
    
    const leftPercent = (startDays / totalDays) * 100;
    const widthPercent = ((endDays - startDays) / totalDays) * 100;
    
    // Color based on crop
    const cropColors = {
      'Romaine': '#10b981',
      'Iceberg': '#3b82f6', 
      'Carrots': '#f59e0b',
      'Broccoli': '#8b5cf6',
      'Cauliflower': '#ef4444'
    };
    
    return {
      left: `${leftPercent}%`,
      width: `${Math.max(widthPercent, 2)}%`,
      backgroundColor: cropColors[planting.crop] || '#6b7280'
    };
  };

  const toggleLotFilter = (lotId) => {
    const newSelected = new Set(selectedLots);
    if (newSelected.has(lotId)) {
      newSelected.delete(lotId);
    } else {
      newSelected.add(lotId);
    }
    setSelectedLots(newSelected);
  };

  const filteredLots = selectedLots.size > 0 
    ? allLots.filter(lot => selectedLots.has(lot.id))
    : allLots;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">📅 Planting Timeline View</h2>
          <div className="text-sm text-gray-600 mt-1">
            Visualize planting schedules and lot utilization • 
            <span className="font-medium ml-1">
              {dateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - 
              {dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="1month">1 Month</option>
            <option value="3months">3 Months</option>
            <option value="6months">6 Months</option>
            <option value="1year">1 Year</option>
          </select>
        </div>
      </div>

      {/* Quick Start Guide */}
      {filteredLots.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Calendar className="text-blue-600 mt-1" size={20} />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">Getting Started with Timeline View</h3>
              <div className="text-sm text-blue-700 mt-1 space-y-1">
                <div>1. Click <strong>"Generate Plantings"</strong> in the header to create plantings from orders</div>
                <div>2. Go to <strong>Land Management</strong> and drag plantings to lots</div>
                <div>3. Return here to see your timeline visualization!</div>
              </div>
              <div className="mt-3 text-xs text-blue-600">
                💡 <strong>Quick tip:</strong> The app already has sample orders loaded, so you can generate plantings right away!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Crop Legend</h3>
        <div className="flex flex-wrap gap-4">
          {['Romaine', 'Iceberg', 'Carrots', 'Broccoli', 'Cauliflower'].map(crop => {
            const cropColors = {
              'Romaine': '#10b981', 'Iceberg': '#3b82f6', 'Carrots': '#f59e0b',
              'Broccoli': '#8b5cf6', 'Cauliflower': '#ef4444'
            };
            const count = plantings.filter(p => p.assigned && p.crop === crop).length;
            return (
              <div key={crop} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: cropColors[crop] }}
                />
                <span className="text-sm text-gray-600">{crop} ({count})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header with date markers */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <div className="w-64 px-4 py-3 bg-gray-50 border-r border-gray-200">
              <span className="font-medium text-gray-900">Lot</span>
            </div>
            <div className="flex-1 relative">
              <div className="flex h-12 border-b border-gray-100">
                {dateMarkers.map((marker, index) => (
                  <div
                    key={index}
                    className={`flex-1 px-1 py-2 text-center border-r border-gray-100 ${
                      marker.isMonth ? 'bg-blue-50 font-medium' : ''
                    }`}
                    style={{ minWidth: '60px' }}
                  >
                    <div className="text-xs text-gray-600">{marker.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gantt rows */}
        <div className="max-h-96 overflow-y-auto">
          {filteredLots.map(lot => (
            <div key={lot.id} className="flex border-b border-gray-100 hover:bg-gray-50">
              {/* Lot info column */}
              <div className="w-64 px-4 py-3 border-r border-gray-200">
                <div className="text-sm font-medium text-gray-900">{lot.displayName}</div>
                <div className="text-xs text-gray-500">
                  {lot.acres} acres • {lot.plantings.length} plantings
                  {lot.plantings.length > 0 && (
                    <span className="ml-1 text-green-600">
                      ({lot.plantings.reduce((acc, p) => acc + parseFloat(p.acres), 0).toFixed(1)} acres used)
                    </span>
                  )}
                </div>
              </div>
              
              {/* Timeline column */}
              <div className="flex-1 relative py-2" style={{ minHeight: '60px' }}>
                {lot.plantings.map((planting, index) => {
                  const barStyle = getPlantingBarStyle(planting);
                  const isVisible = parseFloat(barStyle.left) < 100 && 
                                   (parseFloat(barStyle.left) + parseFloat(barStyle.width)) > 0;
                  
                  return isVisible ? (
                    <div
                      key={planting.id}
                      className="absolute rounded text-white text-xs px-2 py-1 shadow-sm hover:shadow-md transition-all cursor-pointer hover:z-20 border border-opacity-30 border-white"
                      style={{
                        ...barStyle,
                        top: `${index * 22 + 4}px`,
                        height: '18px',
                        zIndex: 10
                      }}
                      title={`${planting.crop} - ${planting.variety}\nCustomer: ${planting.customer}\nAcres: ${planting.acres}\nPlant: ${planting.wetDate}\nHarvest: ${planting.budgetedHarvestDate}${planting.parentPlantingId ? '\n[Split Planting]' : ''}`}
                    >
                      <div className="truncate font-medium">
                        {planting.crop} ({planting.acres}ac)
                        {planting.parentPlantingId && <span className="ml-1">✂️</span>}
                      </div>
                    </div>
                  ) : null;
                })}
                
                {/* Today indicator line */}
                {(() => {
                  const today = new Date();
                  if (today >= dateRange.start && today <= dateRange.end) {
                    const todayPercent = ((today - dateRange.start) / (dateRange.end - dateRange.start)) * 100;
                    return (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30"
                        style={{ left: `${todayPercent}%` }}
                        title={`Today: ${today.toLocaleDateString()}`}
                      />
                    );
                  }
                  return null;
                })()}
                
                {/* Date grid lines */}
                {dateMarkers.map((marker, index) => (
                  <div
                    key={index}
                    className={`absolute top-0 bottom-0 border-r ${marker.isMonth ? 'border-blue-200' : 'border-gray-100'}`}
                    style={{ left: `${(index / (dateMarkers.length - 1)) * 100}%` }}
                  />
                ))}
                
                {/* Empty lot indicator */}
                {lot.plantings.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs italic">
                    No plantings scheduled
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredLots.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <div className="text-lg font-medium mb-2">No plantings to display</div>
            <div className="text-sm">
              Generate plantings first, then assign them to lots to see your timeline.
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {filteredLots.reduce((sum, lot) => sum + lot.plantings.length, 0)}
          </div>
          <div className="text-sm text-gray-600">Active Plantings</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {filteredLots.reduce((sum, lot) => sum + lot.plantings.reduce((acc, p) => acc + parseFloat(p.acres), 0), 0).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Total Acres</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{filteredLots.length}</div>
          <div className="text-sm text-gray-600">Active Lots</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-orange-600">
            {[...new Set(filteredLots.flatMap(lot => lot.plantings.map(p => p.customer)))].length}
          </div>
          <div className="text-sm text-gray-600">Customers</div>
        </div>
      </div>
    </div>
  );
};

const PlanningFeature = ({ plantings }) => {
  const stats = {
    total: plantings.length,
    assigned: plantings.filter(p => p.assigned).length,
    totalAcres: plantings.reduce((sum, p) => sum + parseFloat(p.acres), 0).toFixed(1),
    customers: [...new Set(plantings.map(p => p.customer))].length
  };

  const headers = ['Customer', 'Location', 'Crop & Variety', 'Acres', 'Plant Date', 'Harvest Date', 'Status'];

  const renderRow = (planting) => (
    <tr key={planting.id} className={planting.assigned ? 'bg-blue-50' : 'bg-yellow-50'}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{planting.customer}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {planting.assigned ? `${planting.region} - ${planting.ranch} - Lot ${planting.lot}` : 'Unassigned'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div>{planting.crop}</div>
        <div className="text-xs text-gray-400">{planting.variety}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{planting.acres}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{planting.wetDate}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{planting.budgetedHarvestDate}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          planting.assigned ? 'text-white' : 'bg-yellow-100 text-yellow-800'
        }`}
        style={planting.assigned ? { backgroundColor: '#0f3e62' } : {}}
        >
          {planting.assigned ? 'Assigned' : 'Pending'}
        </span>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Final Crop Plan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold" style={{ color: '#0f3e62' }}>{stats.total}</div>
          <div className="text-sm text-gray-600">Total Plantings</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold" style={{ color: '#2563eb' }}>{stats.assigned}</div>
          <div className="text-sm text-gray-600">Assigned Plantings</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold" style={{ color: '#dc2626' }}>{stats.totalAcres}</div>
          <div className="text-sm text-gray-600">Total Acres</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold" style={{ color: '#7c3aed' }}>{stats.customers}</div>
          <div className="text-sm text-gray-600">Customers</div>
        </div>
      </div>

      <DataTable headers={headers} data={plantings} renderRow={renderRow} />
    </div>
  );
};

const DataManagementFeature = () => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if any data exists
  const hasData = () => {
    if (typeof window === 'undefined') return false;
    return ['cropPlanning_orders', 'cropPlanning_commodities', 'cropPlanning_landStructure', 'cropPlanning_plantings']
      .some(key => localStorage.getItem(key) !== null);
  };

  const exportData = () => {
    try {
      const data = {
        orders: persistenceService.load('cropPlanning_orders', []),
        commodities: persistenceService.load('cropPlanning_commodities', []),
        landStructure: persistenceService.load('cropPlanning_landStructure', []),
        plantings: persistenceService.load('cropPlanning_plantings', []),
        activeTab: persistenceService.load('cropPlanning_activeTab', 'orders'),
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `crop-planning-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setLastBackup(new Date().toLocaleString());
    } catch (error: any) {
      alert('Export failed: ' + error.message);
    }
  };

  const importData = (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate data structure
        if (!data.orders || !data.commodities || !data.landStructure) {
          throw new Error('Invalid backup file format');
        }

        // Import data
        persistenceService.save('cropPlanning_orders', data.orders);
        persistenceService.save('cropPlanning_commodities', data.commodities);
        persistenceService.save('cropPlanning_landStructure', data.landStructure);
        persistenceService.save('cropPlanning_plantings', data.plantings || []);
        
        if (data.activeTab) {
          persistenceService.save('cropPlanning_activeTab', data.activeTab);
        }

        alert('Data imported successfully! Please refresh the page to see changes.');
      } catch (error: any) {
        alert('Import failed: ' + error.message);
      }
    };
    reader.readAsText(file);
    
    // Clear file input
    event.target.value = '';
  };

  const resetData = () => {
    persistenceService.clearAll();
    setShowResetConfirm(false);
    alert('All data has been reset! Please refresh the page to load default data.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Data Persistence Status</h2>
        
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Auto-Save Active</h3>
              <p className="text-sm text-green-700 mt-1">
                Your data is automatically saved to your browser's local storage as you work. 
                Changes to orders, commodities, land structure, and plantings are preserved between sessions.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Saved Data</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {isClient ? (
                <>
                  <div>• Orders: {persistenceService.load('cropPlanning_orders', []).length} entries</div>
                  <div>• Commodities: {persistenceService.load('cropPlanning_commodities', []).length} types</div>
                  <div>• Land Areas: {persistenceService.load('cropPlanning_landStructure', []).length} regions</div>
                  <div>• Plantings: {persistenceService.load('cropPlanning_plantings', []).length} entries</div>
                </>
              ) : (
                <>
                  <div>• Orders: Loading...</div>
                  <div>• Commodities: Loading...</div>
                  <div>• Land Areas: Loading...</div>
                  <div>• Plantings: Loading...</div>
                </>
              )}
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Browser Storage</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Storage Type: localStorage</div>
              <div>Status: {isClient ? (hasData() ? 'Active' : 'Empty') : 'Loading...'}</div>
              <div>Auto-backup: Enabled</div>
              {lastBackup && <div>Last Export: {lastBackup}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🛠️ Data Management Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📤 Export Data</h4>
            <p className="text-sm text-gray-600 mb-3">
              Download all your data as a JSON backup file.
            </p>
            <Button onClick={exportData} className="w-full">
              <Download size={16} />
              Export Backup
            </Button>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📥 Import Data</h4>
            <p className="text-sm text-gray-600 mb-3">
              Restore data from a previously exported backup file.
            </p>
            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
              <Button variant="secondary" className="w-full cursor-pointer">
                Select Backup File
              </Button>
            </label>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🔄 Reset Data</h4>
            <p className="text-sm text-gray-600 mb-3">
              Clear all saved data and return to defaults.
            </p>
            <Button 
              variant="destructive" 
              onClick={() => setShowResetConfirm(true)}
              className="w-full"
            >
              <AlertTriangle size={16} />
              Reset All Data
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Data Persistence Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Your data is saved automatically as you work - no manual saving required</li>
          <li>• Data persists between browser sessions and page refreshes</li>
          <li>• Export regular backups to protect against browser data loss</li>
          <li>• Use import/export to transfer data between different browsers or computers</li>
          <li>• Clearing browser data will remove all saved information</li>
        </ul>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Confirm Data Reset</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to reset all data? This will permanently delete:
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li>• All orders and customer data</li>
              <li>• Commodity and variety configurations</li>
              <li>• Land structure and lot information</li>
              <li>• Generated plantings and assignments</li>
            </ul>
            <p className="text-sm text-red-600 mb-6 font-medium">
              This action cannot be undone. Consider exporting a backup first.
            </p>
            <div className="flex space-x-3">
              <Button 
                variant="destructive" 
                onClick={resetData}
                className="flex-1"
              >
                Yes, Reset All Data
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setShowResetConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// MAIN APPLICATION - Orchestration Layer
// =============================================================================

const CropPlanningApp = () => {
  // Initialize active tab with saved data or default
  const [activeTab, setActiveTab] = useState(() => {
    return persistenceService.load('cropPlanning_activeTab', 'orders');
  });

  // Auto-save active tab when it changes
  useEffect(() => {
    persistenceService.save('cropPlanning_activeTab', activeTab);
  }, [activeTab]);
  
  // Custom hooks for state management
  const { orders, addOrder, updateOrder, deleteOrder } = useOrders();
  const { commodities, addVariety, updateVariety, deleteVariety } = useCommodities();
  const { landStructure, findLot } = useLandManagement();
  const { plantings, generatePlantings, assignPlantingToLot } = usePlantings(orders, commodities, landStructure);
  
  // Split notification management
  const { splitNotification, showSplitNotification, clearSplitNotification } = useSplitNotifications();
  
  // Enhanced drag and drop with smart suggestions
  const dragHandlers = useDragAndDrop(assignPlantingToLot, findLot, landStructure, plantings, showSplitNotification);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Dynamic Crop Planning 
              <span className="text-sm font-normal text-gray-500 ml-2">Complete Agricultural Management System 🌾📊</span>
            </h1>
            <div className="flex gap-2">
              <Button onClick={generatePlantings}>
                <Calendar size={16} />
                Generate Plantings
              </Button>
              <Button variant="secondary" onClick={() => csvService.exportPlantings(plantings)}>
                <Download size={16} />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'orders' && (
          <OrdersFeature 
            orders={orders}
            onAddOrder={addOrder}
            onUpdateOrder={updateOrder}
            onDeleteOrder={deleteOrder}
            commodities={commodities}
          />
        )}
        
        {activeTab === 'commodities' && (
          <CommoditiesFeature 
            commodities={commodities}
            onAddVariety={addVariety}
            onUpdateVariety={updateVariety}
            onDeleteVariety={deleteVariety}
          />
        )}
        
        {activeTab === 'land' && (
          <LandFeature 
            landStructure={landStructure}
            plantings={plantings}
            dragHandlers={dragHandlers}
          />
        )}
        
        {activeTab === 'gantt' && (
          <GanttFeature 
            plantings={plantings}
            landStructure={landStructure}
          />
        )}
        
        {activeTab === 'planning' && (
          <PlanningFeature plantings={plantings} />
        )}
        
        {activeTab === 'data' && (
          <DataManagementFeature />
        )}
      </main>
      
      {/* Modals */}
      <SplitNotificationModal 
        notification={splitNotification} 
        onClose={clearSplitNotification} 
      />
    </div>
  );
};

export default CropPlanningApp;