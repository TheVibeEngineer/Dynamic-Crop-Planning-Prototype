// =============================================================================
// COMMODITIES PAGE - Commodity and variety management
// =============================================================================

'use client';

import React from 'react';
import { CommoditiesFeature } from '@/components/commodities';
import { useAppContext } from '@/components/layout';

export default function CommoditiesPage() {
  const { 
    commodities, 
    addCommodity,
    updateCommodity,
    deleteCommodity,
    addVariety, 
    updateVariety, 
    deleteVariety,
    duplicateVariety
  } = useAppContext();

  return (
    <CommoditiesFeature
      commodities={commodities}
      onAddCommodity={addCommodity}
      onUpdateCommodity={updateCommodity}
      onDeleteCommodity={deleteCommodity}
      onAddVariety={addVariety}
      onUpdateVariety={updateVariety}
      onDeleteVariety={deleteVariety}
      onDuplicateVariety={duplicateVariety}
    />
  );
}
