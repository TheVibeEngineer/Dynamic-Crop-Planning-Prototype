// =============================================================================
// PLANNING PAGE - Crop planning overview and analytics
// =============================================================================

'use client';

import React from 'react';
import { PlanningFeature } from '@/components/planning';
import { useAppContext } from '@/components/layout';

export default function PlanningPage() {
  const { plantings } = useAppContext();

  return (
    <PlanningFeature plantings={plantings} />
  );
}
