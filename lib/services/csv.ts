// =============================================================================
// CSV SERVICE - Data Export Layer
// =============================================================================

import type { Planting } from '@/types';

export const csvService = {
  exportPlantings: (plantings: Planting[]) => {
    const headers = [
      'ID', 'Crop', 'Variety', 'Acres', 'Plant Date', 'Harvest Date', 
      'Market Type', 'Customer', 'Volume Ordered', 'Total Yield', 
      'Budget Yield/Acre', 'Assigned', 'Region', 'Ranch', 'Lot', 'Sublot'
    ];
    
    const csvContent = [
      headers.join(','),
      ...plantings.map(p => [
        p.id,
        p.crop,
        p.variety,
        p.acres,
        p.plantDate,
        p.harvestDate,
        p.marketType,
        p.customer,
        p.volumeOrdered || '',
        p.totalYield || '',
        p.budgetYieldPerAcre || '',
        p.assigned ? 'Yes' : 'No',
        p.region || '',
        p.ranch || '',
        p.lot || '',
        p.sublot || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crop_plantings_${new Date().toISOString().split('T')[0]}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
