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
    updateRegion,
    deleteRegion,
    addRanch,
    updateRanch,
    deleteRanch,
    addLot,
    updateLot,
    deleteLot,
    splitNotification,
    clearSplitNotification,
    recombineNotification,
    clearRecombineNotification,
    optimizeAllPlantings,
    optimizationResults,
    clearOptimizationResults,
    isOptimizing,
    setIsOptimizing
  } = useAppContext();

  const landManagement = {
    addRegion,
    updateRegion,
    deleteRegion,
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
      recombineNotification={recombineNotification}
      clearRecombineNotification={clearRecombineNotification}
      optimizeAllPlantings={optimizeAllPlantings}
      optimizationResults={optimizationResults}
      clearOptimizationResults={clearOptimizationResults}
      isOptimizing={isOptimizing}
      setIsOptimizing={setIsOptimizing}
    />
  );
}
