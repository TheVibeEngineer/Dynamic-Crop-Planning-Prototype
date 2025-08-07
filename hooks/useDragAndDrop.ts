// =============================================================================
// USE DRAG AND DROP HOOK - Drag and drop functionality with smart suggestions
// =============================================================================

import { useState } from 'react';
import type { Planting, SplitNotification } from '@/types/planning';
import type { Region } from '@/types/land';
import type { SmartSuggestion, DragPreview, DragAndDropHandlers } from '@/types/common';
import { optimizationEngine } from '@/lib/services/optimization';
import { capacityService } from '@/lib/services/capacity';

export const useDragAndDrop = (
  assignPlantingToLot: (plantingId: string, regionId: number, ranchId: number, lotId: number) => any,
  unassignPlanting: (plantingId: string) => any,
  findLot: (regionId: number, ranchId: number, lotId: number) => any,
  landStructure: Region[],
  plantings: Planting[],
  showSplitNotification: (notification: SplitNotification) => void
): DragAndDropHandlers => {
  const [draggedPlanting, setDraggedPlanting] = useState<Planting | null>(null);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);

  const handleDragStart = (e: React.DragEvent, planting: Planting) => {
    setDraggedPlanting(planting);
    e.dataTransfer.effectAllowed = 'move';
    
    // Generate smart suggestions when drag starts
    const suggestions = optimizationEngine.findBestLots(planting, landStructure, plantings, 3);
    setSmartSuggestions(suggestions);
  };

  const handleDragOver = (e: React.DragEvent, regionId: number, ranchId: number, lotId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedPlanting) {
      const canFit = capacityService.canFitInLot(
        draggedPlanting.acres,
        regionId,
        ranchId,
        lotId,
        landStructure,
        plantings
      );
      
      const lot = findLot(regionId, ranchId, lotId);
      const region = landStructure.find((r: Region) => r.id === regionId);
      const ranch = region?.ranches.find((r: any) => r.id === ranchId);
      
      if (lot && region && ranch) {
        // Add optimization score to preview
        const score = optimizationEngine.scoreLotForPlanting(
          draggedPlanting, lot, region, ranch, landStructure, plantings
        );
        
        const rotationWarning = optimizationEngine.evaluateCropRotation(draggedPlanting.crop, lot) < -10;
        const capacity = capacityService.calculateLotCapacity(regionId, ranchId, lotId, landStructure, plantings);
        
        setDragPreview({
          x: 0, // Will be set by the UI component
          y: 0, // Will be set by the UI component
          planting: {
            ...draggedPlanting,
            canFit,
            availableAcres: capacity.availableAcres,
            wouldExceedBy: canFit ? 0 : draggedPlanting.acres - capacity.availableAcres,
            willRequireSplit: !canFit && capacity.availableAcres > 0,
            nextSublot: capacityService.getNextSublotDesignation(regionId, ranchId, lotId, plantings),
            optimizationScore: score,
            rotationWarning: rotationWarning
          }
        });
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear preview if we're actually leaving the drop zone
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragPreview(null);
    }
  };

  const handleDragEnd = () => {
    setSmartSuggestions([]);
    setDragPreview(null);
  };

  const handleDrop = (e: React.DragEvent, regionId: number, ranchId: number, lotId: number) => {
    e.preventDefault();
    setDragPreview(null);
    setSmartSuggestions([]);
    
    if (draggedPlanting) {
      const result = assignPlantingToLot(
        draggedPlanting.id, 
        regionId, 
        ranchId, 
        lotId
      );
      
      if (!result.success) {
        if (result.type === 'partial_fit') {
          // Could offer split option here
          alert(`${result.message}. Would you like to split this planting?`);
        } else if (result.type === 'no_capacity') {
          alert(result.message);
        }
      }
      setDraggedPlanting(null);
    }
  };

  const handleDropOnUnassigned = (e: React.DragEvent) => {
    e.preventDefault();
    setDragPreview(null);
    setSmartSuggestions([]);
    
    if (draggedPlanting && draggedPlanting.assigned) {
      const result = unassignPlanting(draggedPlanting.id);
      
      if (!result.success) {
        alert('Failed to unassign planting');
      }
      setDraggedPlanting(null);
    }
  };

  return { 
    draggedPlanting, 
    dragPreview,
    smartSuggestions,
    handleDragStart, 
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
    handleDropOnUnassigned
  };
};
