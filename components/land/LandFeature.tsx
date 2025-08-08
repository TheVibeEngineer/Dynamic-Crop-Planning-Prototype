// =============================================================================
// LAND FEATURE - Land management with drag & drop optimization
// =============================================================================

import React, { useState } from 'react';
import type { 
  Region, 
  Ranch, 
  Lot
} from '@/types/land';
import type { Planting } from '@/types/planning';
import type { 
  SplitNotification, 
  OptimizationResults,
  DragAndDropHandlers 
} from '@/types/common';
import { Button, Modal } from '../common';
import { Zap, RefreshCw, Edit, Trash2, Check, X, CheckCircle, Target, AlertCircle, TrendingUp } from 'lucide-react';
import { SOIL_TYPES, MICROCLIMATES } from '@/lib/constants';
import { optimizationEngine } from '@/lib/services/optimization';

export interface LandFeatureProps {
  landStructure: Region[];
  plantings: Planting[];
  dragHandlers: DragAndDropHandlers;
  landManagement: {
    addRegion: (regionData: Partial<Region>) => void;
    updateRegion: (regionId: number, regionData: Partial<Region>) => void;
    deleteRegion: (regionId: number) => void;
    addRanch: (regionId: number, ranchData: Partial<Ranch>) => void;
    updateRanch: (regionId: number, ranchId: number, ranchData: Partial<Ranch>) => void;
    deleteRanch: (regionId: number, ranchId: number) => void;
    addLot: (regionId: number, ranchId: number, lotData: Partial<Lot>) => void;
    updateLot: (regionId: number, ranchId: number, lotId: number, lotData: Partial<Lot>) => void;
    deleteLot: (regionId: number, ranchId: number, lotId: number) => void;
  };
  splitNotification: SplitNotification | null;
  clearSplitNotification: () => void;
  optimizeAllPlantings: () => void;
  optimizationResults: OptimizationResults | null;
  clearOptimizationResults: () => void;
  isOptimizing?: boolean;
  setIsOptimizing?: (value: boolean) => void;
  recombineNotification?: any | null;
  clearRecombineNotification?: () => void;
}

export const LandFeature: React.FC<LandFeatureProps> = ({ 
  landStructure, 
  plantings, 
  dragHandlers, 
  landManagement,
  splitNotification,
  clearSplitNotification,
  recombineNotification,
  clearRecombineNotification,
  optimizeAllPlantings,
  optimizationResults,
  clearOptimizationResults,
  isOptimizing,
  setIsOptimizing
}) => {
  const { 
    handleDragStart, 
    handleDragOver, 
    handleDragLeave, 
    handleDrop, 
    handleDragEnd, 
    handleDropOnUnassigned,
    dragPreview, 
    draggedPlanting, 
    smartSuggestions 
  } = dragHandlers;
  
  const { addRegion, updateRegion, deleteRegion, addRanch, updateRanch, deleteRanch, addLot, updateLot, deleteLot } = landManagement;
  
  // Form states
  const [showRanchForm, setShowRanchForm] = useState(false);
  const [showLotForm, setShowLotForm] = useState(false);
  const [showRegionForm, setShowRegionForm] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [editingRanch, setEditingRanch] = useState<Ranch | null>(null);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedRanchId, setSelectedRanchId] = useState<number | null>(null);
  
  // Confirmation states for deletions
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'region' | 'ranch' | 'lot';
    id: number;
    regionId?: number;
    ranchId?: number;
    name: string;
  } | null>(null);
  
  // Error state for validation
  const [formError, setFormError] = useState<string | null>(null);
  
  // Hover suggestions state
  const [hoverSuggestions, setHoverSuggestions] = useState<any[]>([]);
  const [hoveredPlanting, setHoveredPlanting] = useState<any>(null);
  
  // Form data
  const [regionFormData, setRegionFormData] = useState({ name: '' });
  const [ranchFormData, setRanchFormData] = useState({ name: '' });
  const [lotFormData, setLotFormData] = useState({
    number: '', 
    acres: '', 
    soilType: 'Sandy Loam', 
    lastCrop: '', 
    lastPlantDate: '', 
    microclimate: 'Moderate'
  });

  // Optimization handler
  const handleOptimizeAll = async () => {
    if (setIsOptimizing) {
      setIsOptimizing(true);
    }
    
    // Simulate processing time for better UX
    setTimeout(() => {
      optimizeAllPlantings();
      if (setIsOptimizing) {
        setIsOptimizing(false);
      }
    }, 1500);
  };

  // Form handlers
  const handleAddRegion = () => {
    setRegionFormData({ name: '' });
    setShowRegionForm(true);
  };

  const handleSubmitRegion = () => {
    if (regionFormData.name) {
      if (editingRegion) {
        updateRegion(editingRegion.id, { region: regionFormData.name });
      } else {
        addRegion({ region: regionFormData.name });
      }
      setRegionFormData({ name: '' });
      setShowRegionForm(false);
      setEditingRegion(null);
    }
  };

  const handleSubmitRanch = () => {
    if (ranchFormData.name && selectedRegionId) {
      if (editingRanch) {
        updateRanch(selectedRegionId, editingRanch.id, { name: ranchFormData.name });
      } else {
        addRanch(selectedRegionId, { name: ranchFormData.name });
      }
      setRanchFormData({ name: '' });
      resetForms();
    }
  };

  const handleSubmitLot = () => {
    if (lotFormData.number && lotFormData.acres && selectedRegionId && selectedRanchId) {
      try {
        setFormError(null); // Clear any previous errors
        
        if (editingLot) {
          updateLot(selectedRegionId, selectedRanchId, editingLot.id, {
            number: lotFormData.number,
            acres: parseFloat(lotFormData.acres),
            soilType: lotFormData.soilType,
            lastCrop: lotFormData.lastCrop,
            lastPlantDate: lotFormData.lastPlantDate,
            microclimate: lotFormData.microclimate
          });
        } else {
          addLot(selectedRegionId, selectedRanchId, {
            number: lotFormData.number,
            acres: parseFloat(lotFormData.acres),
            soilType: lotFormData.soilType,
            lastCrop: lotFormData.lastCrop,
            lastPlantDate: lotFormData.lastPlantDate,
            microclimate: lotFormData.microclimate
          });
        }
        
        setLotFormData({
          number: '', 
          acres: '', 
          soilType: 'Sandy Loam', 
          lastCrop: '', 
          lastPlantDate: '', 
          microclimate: 'Moderate'
        });
        resetForms();
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'An error occurred');
      }
    }
  };

  const resetForms = () => {
    setShowRanchForm(false);
    setShowLotForm(false);
    setShowRegionForm(false);
    setEditingRegion(null);
    setEditingRanch(null);
    setEditingLot(null);
    setSelectedRegionId(null);
    setSelectedRanchId(null);
    setFormError(null);
  };

  // Edit handlers
  const handleEditRegion = (region: Region) => {
    setEditingRegion(region);
    setRegionFormData({ name: region.region });
    setShowRegionForm(true);
  };

  const handleEditRanch = (regionId: number, ranch: Ranch) => {
    setSelectedRegionId(regionId);
    setEditingRanch(ranch);
    setRanchFormData({ name: ranch.name });
    setShowRanchForm(true);
  };

  const handleEditLot = (regionId: number, ranchId: number, lot: Lot) => {
    setSelectedRegionId(regionId);
    setSelectedRanchId(ranchId);
    setEditingLot(lot);
    setLotFormData({
      number: lot.number,
      acres: lot.acres.toString(),
      soilType: lot.soilType,
      lastCrop: lot.lastCrop || '',
      lastPlantDate: lot.lastPlantDate || '',
      microclimate: lot.microclimate
    });
    setShowLotForm(true);
  };

  // Delete handlers
  const handleDeleteConfirm = (type: 'region' | 'ranch' | 'lot', id: number, name: string, regionId?: number, ranchId?: number) => {
    setConfirmDelete({ type, id, name, regionId, ranchId });
  };

  const executeDelete = () => {
    if (!confirmDelete) return;

    switch (confirmDelete.type) {
      case 'region':
        deleteRegion(confirmDelete.id);
        break;
      case 'ranch':
        if (confirmDelete.regionId) {
          deleteRanch(confirmDelete.regionId, confirmDelete.id);
        }
        break;
      case 'lot':
        if (confirmDelete.regionId && confirmDelete.ranchId) {
          deleteLot(confirmDelete.regionId, confirmDelete.ranchId, confirmDelete.id);
        }
        break;
    }
    setConfirmDelete(null);
  };

  // Helper function to check if lot number is available
  const isLotNumberAvailable = (lotNumber: string, regionId: number, ranchId: number, excludeLotId?: number) => {
    const region = landStructure.find(r => r.id === regionId);
    const ranch = region?.ranches.find(r => r.id === ranchId);
    const existingLot = ranch?.lots.find(l => l.number === lotNumber && l.id !== excludeLotId);
    return !existingLot;
  };

  const unassignedCount = plantings.filter(p => !p.assigned).length;

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Smart Land Management</h2>
        <div className="flex gap-2">
          <Button onClick={handleAddRegion}>Add Region</Button>
          {unassignedCount > 0 && (
            <Button 
              variant="success" 
              onClick={handleOptimizeAll}
              disabled={isOptimizing}
              className="relative"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  🤖 Optimize All ({unassignedCount})
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Main Layout - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side - Unassigned Plantings Panel */}
        <div className="lg:col-span-4">
          <div 
            className="bg-white rounded-lg shadow-sm border p-6 sticky top-4"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={handleDropOnUnassigned}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Unassigned Plantings ({unassignedCount})
              </h3>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              {unassignedCount > 0 
                ? "Drag plantings to lots to assign them • Drag assigned plantings here to unassign"
                : "Drag assigned plantings here to unassign them"
              }
            </div>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {plantings
                .filter(p => !p.assigned)
                .map(planting => (
                  <div
                    key={planting.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, planting)}
                    onDragEnd={handleDragEnd}
                    onMouseEnter={() => {
                      const suggestions = optimizationEngine.findBestLots(planting, landStructure, plantings, 3);
                      setHoverSuggestions(suggestions);
                      setHoveredPlanting(planting);
                    }}
                    onMouseLeave={() => {
                      setHoverSuggestions([]);
                      setHoveredPlanting(null);
                    }}
                    className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-move hover:bg-yellow-100 transition-colors"
                  >
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {planting.crop} - {planting.variety}
                    </div>
                    <div className="text-sm text-gray-600">{planting.customer}</div>
                    <div className="text-sm text-gray-600">
                      {planting.volumeOrdered?.toLocaleString()} {planting.marketType === 'Fresh Cut' ? 'cartons' : 'lbs'} 
                      • <span className="font-medium">{planting.acres} acres</span> • Plant: {planting.plantDate}
                    </div>
                  </div>
                ))}
              {unassignedCount === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-lg mb-2">🎉 All plantings assigned!</div>
                  <div className="text-sm">Great work! All your plantings have been assigned to lots.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Land Structure */}
        <div className="lg:col-span-8">
          <div className="space-y-4">
        {landStructure.map(region => (
          <div key={region.id} className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">📍 {region.region}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditRegion(region)}
                    className="text-xs p-2"
                    title="Edit Region"
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteConfirm('region', region.id, region.region)}
                    className="text-xs p-2 text-red-600 hover:text-red-700"
                    title="Delete Region"
                  >
                    <Trash2 size={14} />
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setSelectedRegionId(region.id);
                      setShowRanchForm(true);
                    }}
                    className="text-sm"
                  >
                    Add Ranch
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {region.ranches.map(ranch => (
                <div key={ranch.id} className="border rounded-lg">
                  <div className="p-3 bg-blue-50 border-b">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-blue-900">🏪 {ranch.name}</h4>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRanch(region.id, ranch)}
                          className="text-xs p-1"
                          title="Edit Ranch"
                        >
                          <Edit size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteConfirm('ranch', ranch.id, ranch.name, region.id)}
                          className="text-xs p-1 text-red-600 hover:text-red-700"
                          title="Delete Ranch"
                        >
                          <Trash2 size={12} />
                        </Button>
                        <Button 
                          variant="secondary"
                          onClick={() => {
                            setSelectedRegionId(region.id);
                            setSelectedRanchId(ranch.id);
                            setShowLotForm(true);
                          }}
                          className="text-xs px-2 py-1"
                        >
                          Add Lot
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {ranch.lots.map(lot => {
                      const lotPlantings = plantings.filter(p => 
                        p.assigned && p.uniqueLotId === `${region.id}-${ranch.id}-${lot.id}`
                      );
                      const usedAcres = lotPlantings.reduce((sum, p) => sum + p.acres, 0);
                      const utilizationRate = (usedAcres / lot.acres) * 100;
                      
                      return (
                        <div
                          key={lot.id}
                          className="group border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                          onDragOver={(e) => handleDragOver(e, region.id, ranch.id, lot.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, region.id, ranch.id, lot.id)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-gray-900">Lot {lot.number}</div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditLot(region.id, ranch.id, lot)}
                                className="text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Edit Lot"
                              >
                                <Edit size={10} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteConfirm('lot', lot.id, `Lot ${lot.number}`, region.id, ranch.id)}
                                className="text-xs p-1 text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Lot"
                              >
                                <Trash2 size={10} />
                              </Button>
                              <div className="text-xs text-gray-600">{lot.acres} acres</div>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>Soil: {lot.soilType}</div>
                            <div>Climate: {lot.microclimate}</div>
                            <div>Used: {usedAcres.toFixed(1)} acres ({utilizationRate.toFixed(0)}%)</div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>{usedAcres.toFixed(1)} of {lot.acres} acres used</span>
                              <span>{(lot.acres - usedAcres).toFixed(1)} available</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  utilizationRate > 95 ? 'bg-red-500' : 
                                  utilizationRate > 80 ? 'bg-yellow-500' : 
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Assigned Plantings */}
                          {lotPlantings.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {lotPlantings.slice(0, 2).map(planting => (
                                <div 
                                  key={planting.id} 
                                  className="p-2 rounded text-sm text-white cursor-move hover:opacity-90 transition-opacity" 
                                  style={{ backgroundColor: '#0f3e62' }}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, planting)}
                                  onDragEnd={handleDragEnd}
                                >
                                  <div className="font-medium flex items-center gap-2">
                                    {planting.crop} - {planting.variety}
                                    {planting.parentPlantingId && (
                                      <span className="text-xs bg-blue-200 text-blue-800 px-1 py-0.5 rounded flex items-center gap-1">
                                        Split
                                      </span>
                                    )}
                                  </div>
                                  <div className="opacity-90 text-xs">
                                    {planting.customer} • {planting.acres} acres • {planting.plantDate}
                                  </div>
                                  {planting.originalOrderId && (
                                    <div className="text-xs opacity-75">
                                      Order: {planting.originalOrderId}
                                    </div>
                                  )}
                                </div>
                              ))}
                              {lotPlantings.length > 2 && (
                                <div className="text-xs text-gray-500 pl-2">
                                  +{lotPlantings.length - 2} more plantings...
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
          </div>
        </div>
      </div>

      {/* Drag Preview with Smart Scoring */}
      {dragPreview && draggedPlanting && (
        <DragPreview dragPreview={dragPreview} draggedPlanting={draggedPlanting} />
      )}

      {/* Smart Suggestions Panel - During Drag */}
      {smartSuggestions && smartSuggestions.length > 0 && draggedPlanting && (
        <SmartSuggestionsPanel suggestions={smartSuggestions} draggedPlanting={draggedPlanting} isDragging={true} />
      )}

      {/* Hover Suggestions Panel - On Hover */}
      {hoverSuggestions && hoverSuggestions.length > 0 && hoveredPlanting && !draggedPlanting && (
        <SmartSuggestionsPanel suggestions={hoverSuggestions} draggedPlanting={hoveredPlanting} isDragging={false} />
      )}

      {/* Region Form Modal */}
      <Modal
        isOpen={showRegionForm}
        onClose={resetForms}
        title={editingRegion ? "Edit Region" : "Add New Region"}
        footer={
          <>
            <Button variant="secondary" onClick={resetForms}>Cancel</Button>
            <Button onClick={handleSubmitRegion}>
              {editingRegion ? "Update Region" : "Add Region"}
            </Button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Region Name
          </label>
          <input
            type="text"
            placeholder="Region name"
            value={regionFormData.name}
            onChange={(e) => setRegionFormData({ name: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>
      </Modal>

      {/* Ranch Form Modal */}
      <Modal
        isOpen={showRanchForm}
        onClose={resetForms}
        title={editingRanch ? "Edit Ranch" : "Add New Ranch"}
        footer={
          <>
            <Button variant="secondary" onClick={resetForms}>Cancel</Button>
            <Button onClick={handleSubmitRanch}>
              {editingRanch ? "Update Ranch" : "Add Ranch"}
            </Button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ranch Name
          </label>
          <input
            type="text"
            placeholder="Ranch name"
            value={ranchFormData.name}
            onChange={(e) => setRanchFormData({ name: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>
      </Modal>

      {/* Lot Form Modal */}
      <Modal
        isOpen={showLotForm}
        onClose={resetForms}
        title={editingLot ? "Edit Lot" : "Add New Lot"}
        footer={
          <>
            <Button variant="secondary" onClick={resetForms}>Cancel</Button>
            <Button 
              onClick={handleSubmitLot}
              disabled={
                !lotFormData.number || 
                !lotFormData.acres || 
                Boolean(selectedRegionId && selectedRanchId && lotFormData.number && 
                 !isLotNumberAvailable(lotFormData.number, selectedRegionId, selectedRanchId, editingLot?.id))
              }
            >
              {editingLot ? "Update Lot" : "Add Lot"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <X size={16} className="text-red-600" />
                <span className="text-red-800 text-sm font-medium">Validation Error</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{formError}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lot Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Lot number"
                  value={lotFormData.number}
                  onChange={(e) => {
                    setLotFormData({...lotFormData, number: e.target.value});
                    // Clear error when user starts typing
                    if (formError) setFormError(null);
                  }}
                  className={`w-full p-2 border rounded-lg text-gray-900 ${
                    lotFormData.number && selectedRegionId && selectedRanchId && 
                    !isLotNumberAvailable(lotFormData.number, selectedRegionId, selectedRanchId, editingLot?.id)
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                />
                {lotFormData.number && selectedRegionId && selectedRanchId && (
                  <div className="absolute right-2 top-2">
                    {isLotNumberAvailable(lotFormData.number, selectedRegionId, selectedRanchId, editingLot?.id) ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <X size={16} className="text-red-600" />
                    )}
                  </div>
                )}
              </div>
              {lotFormData.number && selectedRegionId && selectedRanchId && 
               !isLotNumberAvailable(lotFormData.number, selectedRegionId, selectedRanchId, editingLot?.id) && (
                <p className="text-red-600 text-xs mt-1">
                  Lot number "{lotFormData.number}" already exists in this ranch
                </p>
              )}
              {selectedRegionId && selectedRanchId && (
                (() => {
                  const region = landStructure.find(r => r.id === selectedRegionId);
                  const ranch = region?.ranches.find(r => r.id === selectedRanchId);
                  const existingLots = ranch?.lots.filter(l => editingLot ? l.id !== editingLot.id : true) || [];
                  
                  if (existingLots.length > 0) {
                    return (
                      <p className="text-gray-500 text-xs mt-1">
                        Existing lots: {existingLots.map(l => l.number).join(', ')}
                      </p>
                    );
                  }
                  return null;
                })()
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acres
              </label>
              <input
                type="number"
                placeholder="Acres"
                value={lotFormData.acres}
                onChange={(e) => setLotFormData({...lotFormData, acres: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soil Type
              </label>
              <select
                value={lotFormData.soilType}
                onChange={(e) => setLotFormData({...lotFormData, soilType: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
              >
                {SOIL_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Microclimate
              </label>
              <select
                value={lotFormData.microclimate}
                onChange={(e) => setLotFormData({...lotFormData, microclimate: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
              >
                {MICROCLIMATES.map(climate => (
                  <option key={climate} value={climate}>{climate}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Crop (Optional)
              </label>
              <input
                type="text"
                placeholder="Last crop grown"
                value={lotFormData.lastCrop}
                onChange={(e) => setLotFormData({...lotFormData, lastCrop: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Plant Date (Optional)
              </label>
              <input
                type="date"
                value={lotFormData.lastPlantDate}
                onChange={(e) => setLotFormData({...lotFormData, lastPlantDate: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Split Notification */}
      <Modal
        isOpen={!!splitNotification}
        onClose={clearSplitNotification}
        title="✂️ Planting Split Successfully"
        size="md"
        footer={
          <Button onClick={clearSplitNotification}>Got it!</Button>
        }
      >
        {splitNotification && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-blue-600 text-2xl">✂️</div>
              <div>
                <div className="font-medium text-blue-900">
                  Planting was automatically split due to lot capacity
                </div>
                <div className="text-sm text-blue-700">
                  {splitNotification.crop} - {splitNotification.variety}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-800 mb-2">Split Summary:</div>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Original:</strong> {splitNotification.originalAcres} acres</div>
                <div><strong>Assigned:</strong> {splitNotification.assignedAcres} acres to {splitNotification.lotLocation}</div>
                <div><strong>Remaining:</strong> {splitNotification.remainingAcres} acres (unassigned)</div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <strong>💡 Tip:</strong> The remaining {splitNotification.remainingAcres} acres will appear in the unassigned plantings list. 
              You can drag it to another lot with sufficient capacity.
            </div>
          </div>
        )}
      </Modal>

      {/* Recombine Notification */}
      <Modal
        isOpen={!!recombineNotification}
        onClose={clearRecombineNotification || (() => {})}
        title="🔄 Plantings Recombined Successfully"
        size="md"
        footer={
          <Button onClick={clearRecombineNotification || (() => {})}>Got it!</Button>
        }
      >
        {recombineNotification && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="text-green-600 text-2xl">🔄</div>
              <div>
                <div className="font-medium text-green-900">
                  Split plantings were automatically recombined
                </div>
                <div className="text-sm text-green-700">
                  {recombineNotification.crop} - {recombineNotification.variety}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-800 mb-2">Recombination Summary:</div>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Combined:</strong> {recombineNotification.splitCount} split plantings</div>
                <div><strong>Total Acres:</strong> {recombineNotification.combinedAcres} acres</div>
                <div><strong>Status:</strong> Unassigned (ready for new placement)</div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <strong>✨ Smart Feature:</strong> When all parts of a split planting become unassigned, 
              they automatically recombine back into the original planting. You can now drag this 
              {recombineNotification.combinedAcres}-acre planting to any suitable lot.
            </div>
          </div>
        )}
      </Modal>

      {/* Optimization Results */}
      {optimizationResults && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🤖 Optimization Results
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-2xl text-gray-900">{optimizationResults.summary.totalPlantings}</div>
                  <div className="text-gray-700 font-medium">Total Plantings</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-gray-900">{optimizationResults.summary.successfulAssignments}</div>
                  <div className="text-gray-700 font-medium">Assigned</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-gray-900">{optimizationResults.summary.averageScore}</div>
                  <div className="text-gray-700 font-medium">Avg Score</div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={clearOptimizationResults}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmDelete(null)}
          title="Confirm Deletion"
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="danger" onClick={executeDelete}>
                Delete {confirmDelete.type === 'region' ? 'Region' : confirmDelete.type === 'ranch' ? 'Ranch' : 'Lot'}
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-gray-700">
              Are you sure you want to delete{' '}
              <span className="font-medium">{confirmDelete.name}</span>?
            </p>
            {confirmDelete.type === 'region' && (
              <p className="text-sm text-red-600">
                ⚠️ This will also delete all ranches and lots within this region.
              </p>
            )}
            {confirmDelete.type === 'ranch' && (
              <p className="text-sm text-red-600">
                ⚠️ This will also delete all lots within this ranch.
              </p>
            )}
            {confirmDelete.type === 'lot' && (
              <p className="text-sm text-red-600">
                ⚠️ Any plantings assigned to this lot will become unassigned.
              </p>
            )}
            <p className="text-sm text-gray-600">
              This action cannot be undone.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Drag Preview Component with Smart Scoring
const DragPreview: React.FC<{ dragPreview: any; draggedPlanting: any }> = ({ dragPreview, draggedPlanting }) => {
  if (!dragPreview || !draggedPlanting) return null;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };
  
  return (
    <div className={`fixed z-50 p-3 rounded-lg border-2 pointer-events-none shadow-lg ${
      dragPreview.planting?.canFit ? 'border-green-400 bg-green-50' : 
      dragPreview.planting?.willRequireSplit ? 'border-orange-400 bg-orange-50' :
      'border-red-400 bg-red-50'
    }`} style={{ top: '10px', right: '10px', minWidth: '240px' }}>
      {dragPreview.planting?.canFit ? (
        <div className="text-green-800">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle size={16} />
            ✅ Fits in Lot
          </div>
          <div className="text-sm mt-1">
            Will use {draggedPlanting.acres} of {dragPreview.planting?.availableAcres} available acres
          </div>
          {dragPreview.planting?.optimizationScore >= 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Target size={12} />
              <span className={`text-sm font-medium ${getScoreColor(dragPreview.planting.optimizationScore)}`}>
                {getScoreLabel(dragPreview.planting.optimizationScore)} ({Math.round(dragPreview.planting.optimizationScore)} pts)
              </span>
            </div>
          )}
          {dragPreview.planting?.rotationWarning && (
            <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
              <AlertCircle size={10} />
              Crop rotation concern
            </div>
          )}
        </div>
      ) : dragPreview.planting?.willRequireSplit ? (
        <div className="text-orange-800">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle size={16} />
            ⚠️ Requires Split
          </div>
          <div className="text-sm mt-1">
            Can fit {dragPreview.planting?.availableAcres} of {draggedPlanting.acres} acres
          </div>
          <div className="text-xs mt-1">
            {draggedPlanting.acres - dragPreview.planting?.availableAcres} acres will remain unassigned
          </div>
          {dragPreview.planting?.optimizationScore >= 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Target size={12} />
              <span className={`text-sm font-medium ${getScoreColor(dragPreview.planting.optimizationScore)}`}>
                {getScoreLabel(dragPreview.planting.optimizationScore)} ({Math.round(dragPreview.planting.optimizationScore)} pts)
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-red-800">
          <div className="flex items-center gap-2 font-medium">
            <X size={16} />
            ❌ No Capacity
          </div>
          <div className="text-sm mt-1">
            Lot is full - {dragPreview.planting?.wouldExceedBy} acres over capacity
          </div>
        </div>
      )}
    </div>
  );
};

// Smart Suggestions Panel Component
const SmartSuggestionsPanel: React.FC<{ suggestions: any[]; draggedPlanting: any; isDragging?: boolean }> = ({ suggestions, draggedPlanting, isDragging = false }) => {
  if (!suggestions || suggestions.length === 0 || !draggedPlanting) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp size={14} className="text-green-600" />;
    if (score >= 60) return <Target size={14} className="text-yellow-600" />;
    return <AlertCircle size={14} className="text-red-600" />;
  };

  return (
    <div className="fixed top-4 left-4 bg-white rounded-lg shadow-lg border p-4 z-40 max-w-sm">
      <div className="flex items-center gap-2 mb-3 text-gray-900 font-medium">
        <Target size={16} className="text-blue-600" />
        {isDragging ? '🎯 Smart Recommendations' : '💡 Best Lot Options'}
      </div>
      <div className="text-xs text-gray-600 mb-3">
        For: <span className="font-medium">{draggedPlanting.crop} - {draggedPlanting.variety}</span> 
        ({draggedPlanting.acres} acres)
      </div>
      <div className="space-y-2">
        {suggestions.slice(0, 3).map((suggestion, index) => (
          <div 
            key={suggestion.lotId || index}
            className={`p-2 rounded border text-xs ${getScoreColor(suggestion.score)}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                {getScoreIcon(suggestion.score)}
                <span className="font-medium">#{index + 1}</span>
              </div>
              <span className="font-bold">{Math.round(suggestion.score)} pts</span>
            </div>
            <div className="font-medium text-xs mb-1">
              {suggestion.location || `${suggestion.region?.region} > ${suggestion.ranch?.name} > Lot ${suggestion.lot?.number}`}
            </div>
            <div className="text-xs opacity-90">
              {suggestion.fitType === 'perfect' ? '✅ Perfect fit' : 
               suggestion.fitType === 'split' ? '⚠️ Requires split' : '❌ No capacity'}
            </div>
            {suggestion.reasons && suggestion.reasons.length > 0 && (
              <div className="text-xs opacity-75 mt-1">
                {suggestion.reasons.slice(0, 2).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        {isDragging 
          ? '💡 Drag to any suggested lot for optimal placement'
          : '🚀 Start dragging to assign to suggested lots'
        }
      </div>
    </div>
  );
};
