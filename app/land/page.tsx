// =============================================================================
// LAND PAGE - Land management with drag & drop optimization
// =============================================================================

'use client';

import React from 'react';
import { LandFeature } from '@/components/land';
import { useAppContext } from '@/components/layout';

export default function LandPage() {
  const {
    landStructure,
    plantings,
    dragHandlers,
    addRegion,
    addRanch,
    updateRanch,
    deleteRanch,
    addLot,
    updateLot,
    deleteLot,
    splitNotification,
    clearSplitNotification,
    optimizeAllPlantings,
    optimizationResults,
    clearOptimizationResults,
    isOptimizing,
    setIsOptimizing
  } = useAppContext();

  const landManagement = {
    addRegion,
    addRanch,
    updateRanch,
    deleteRanch,
    addLot,
    updateLot,
    deleteLot
  };

  return (
    <LandFeature
      landStructure={landStructure}
      plantings={plantings}
      dragHandlers={dragHandlers}
      landManagement={landManagement}
      splitNotification={splitNotification}
      clearSplitNotification={clearSplitNotification}
      optimizeAllPlantings={optimizeAllPlantings}
      optimizationResults={optimizationResults}
      clearOptimizationResults={clearOptimizationResults}
      isOptimizing={isOptimizing}
      setIsOptimizing={setIsOptimizing}
    />
  );
}
