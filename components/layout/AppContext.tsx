// =============================================================================
// APP CONTEXT - Global state management context
// =============================================================================

'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useCommodities } from '@/hooks/useCommodities';
import { useLandManagement } from '@/hooks/useLandManagement';
import { usePlantings } from '@/hooks/usePlantings';
import { useSplitNotifications, useOptimizationResults } from '@/hooks/useNotifications';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { csvService } from '@/lib/services/csv';
import type { Order } from '@/types/orders';
import type { Commodity } from '@/types/commodities';
import type { Region } from '@/types/land';
import type { Planting, SplitNotification, OptimizationResults } from '@/types/planning';
import type { DragPreview } from '@/types/common';

// Define the context type
export interface AppContextType {
  // Data
  orders: Order[];
  commodities: Commodity[];
  landStructure: Region[];
  plantings: Planting[];
  
  // Order actions
  addOrder: (orderData: Partial<Order>) => void;
  updateOrder: (id: number, orderData: Partial<Order>) => void;
  deleteOrder: (id: number) => void;
  
  // Commodity actions
  addCommodity: (commodityData: any) => void;
  updateCommodity: (commodityId: number, commodityData: any) => void;
  deleteCommodity: (commodityId: number) => void;
  addVariety: (commodityName: string, variety: any) => void;
  updateVariety: (commodityName: string, varietyId: number, variety: any) => void;
  deleteVariety: (commodityName: string, varietyId: number) => void;
  duplicateVariety: (commodityName: string, varietyId: number) => void;
  
  // Land actions
  addRegion: (region: Partial<Region>) => void;
  updateRegion: (regionId: number, regionData: Partial<Region>) => void;
  deleteRegion: (regionId: number) => void;
  addRanch: (regionId: number, ranch: any) => void;
  updateRanch: (regionId: number, ranchId: number, ranch: any) => void;
  deleteRanch: (regionId: number, ranchId: number) => void;
  addLot: (regionId: number, ranchId: number, lot: any) => void;
  updateLot: (regionId: number, ranchId: number, lotId: number, lot: any) => void;
  deleteLot: (regionId: number, ranchId: number, lotId: number) => void;
  findLot: (regionId: number, ranchId: number, lotId: number) => any;
  
  // Planting actions
  generatePlantings: () => void;
  assignPlantingToLot: (plantingId: string, regionId: number, ranchId: number, lotId: number) => void;
  unassignPlanting: (plantingId: string) => void;
  optimizeAllPlantings: () => void;
  
  // Drag and drop
  dragHandlers: {
    handleDragStart: (e: any, planting: Planting) => void;
    handleDragOver: (e: any, regionId: number, ranchId: number, lotId: number) => void;
    handleDrop: (e: any, regionId: number, ranchId: number, lotId: number) => void;
    handleDragEnd: () => void;
    draggedPlanting: Planting | null;
    dragPreview: DragPreview | null;
  };
  
  // Notifications
  splitNotification: SplitNotification | null;
  showSplitNotification: (notification: SplitNotification) => void;
  clearSplitNotification: () => void;
  
  // Optimization
  optimizationResults: OptimizationResults | null;
  isOptimizing: boolean;
  setIsOptimizing: (isOptimizing: boolean) => void;
  showOptimizationResults: (results: OptimizationResults) => void;
  clearOptimizationResults: () => void;
  
  // Export
  handleExportCSV: () => void;
}

// Create the context
const AppContext = createContext<AppContextType | null>(null);

// Provider component
export interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Initialize all hooks
  const { orders, addOrder, updateOrder, deleteOrder } = useOrders();
  const { commodities, addCommodity, updateCommodity, deleteCommodity, addVariety, updateVariety, deleteVariety, duplicateVariety } = useCommodities();
  
  // Initialize all hooks with proper dependencies
  const { plantings, generatePlantings, assignPlantingToLot, unassignPlanting, optimizeAllPlantings, setLandStructure } = usePlantings(orders, commodities);
  const { 
    landStructure, 
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
  } = useLandManagement(plantings, unassignPlanting);
  
  // Inject land structure into plantings hook
  useEffect(() => {
    setLandStructure(landStructure);
  }, [landStructure, setLandStructure]);
  
  // Notifications and optimization
  const { splitNotification, showSplitNotification, clearSplitNotification } = useSplitNotifications();
  const { optimizationResults, isOptimizing, setIsOptimizing, showOptimizationResults, clearOptimizationResults } = useOptimizationResults();
  
  // Drag and drop
  const dragHandlers = useDragAndDrop(assignPlantingToLot, unassignPlanting, findLot, landStructure, plantings, showSplitNotification);

  // Enhanced optimization function
  const handleOptimizeAllPlantings = () => {
    return optimizeAllPlantings(showSplitNotification, (results) => {
      showOptimizationResults(results);
    });
  };

  // Wrapper for generatePlantings
  const handleGeneratePlantings = () => {
    generatePlantings();
  };

  // Export CSV handler
  const handleExportCSV = () => {
    csvService.exportPlantings(plantings);
  };

  // Create context value
  const contextValue: AppContextType = {
    // Data
    orders,
    commodities,
    landStructure,
    plantings,
    
    // Order actions
    addOrder,
    updateOrder,
    deleteOrder,
    
    // Commodity actions
    addCommodity,
    updateCommodity,
    deleteCommodity,
    addVariety,
    updateVariety,
    deleteVariety,
    duplicateVariety,
    
    // Land actions
    addRegion,
    updateRegion,
    deleteRegion,
    addRanch,
    updateRanch,
    deleteRanch,
    addLot,
    updateLot,
    deleteLot,
    findLot,
    
    // Planting actions
    generatePlantings: handleGeneratePlantings,
    assignPlantingToLot,
    unassignPlanting,
    optimizeAllPlantings: handleOptimizeAllPlantings,
    
    // Drag and drop
    dragHandlers,
    
    // Notifications
    splitNotification,
    showSplitNotification,
    clearSplitNotification,
    
    // Optimization
    optimizationResults,
    isOptimizing,
    setIsOptimizing,
    showOptimizationResults,
    clearOptimizationResults,
    
    // Export
    handleExportCSV,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
