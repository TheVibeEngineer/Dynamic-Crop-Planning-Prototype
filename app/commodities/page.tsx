// =============================================================================
// COMMODITIES PAGE - Commodity and variety management
// =============================================================================

'use client';

import React from 'react';
import { CommoditiesFeature } from '@/components/commodities';
import { useAppContext } from '@/components/layout';

export default function CommoditiesPage() {
  const { commodities, addVariety, updateVariety, deleteVariety } = useAppContext();

  return (
    <CommoditiesFeature
      commodities={commodities}
      onAddVariety={addVariety}
      onUpdateVariety={updateVariety}
      onDeleteVariety={deleteVariety}
    />
  );
}
