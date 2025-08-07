// =============================================================================
// GANTT PAGE - Timeline view for plantings
// =============================================================================

'use client';

import React from 'react';
import { GanttFeature } from '@/components/planning';
import { useAppContext } from '@/components/layout';

export default function GanttPage() {
  const { plantings, landStructure } = useAppContext();

  return (
    <GanttFeature
      plantings={plantings}
      landStructure={landStructure}
    />
  );
}
