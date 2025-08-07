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
import { Zap, RefreshCw } from 'lucide-react';
import { SOIL_TYPES, MICROCLIMATES } from '@/lib/constants';

export interface LandFeatureProps {
  landStructure: Region[];
  plantings: Planting[];
  dragHandlers: DragAndDropHandlers;
  landManagement: {
    addRegion: (regionData: Partial<Region>) => void;
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
}

export const LandFeature: React.FC<LandFeatureProps> = ({ 
  landStructure, 
  plantings, 
  dragHandlers, 
  landManagement,
  splitNotification,
  clearSplitNotification,
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
  
  const { addRegion, addRanch, updateRanch, deleteRanch, addLot, updateLot, deleteLot } = landManagement;
  
  // Form states
  const [showRanchForm, setShowRanchForm] = useState(false);
  const [showLotForm, setShowLotForm] = useState(false);
  const [showRegionForm, setShowRegionForm] = useState(false);
  const [editingRanch, setEditingRanch] = useState<Ranch | null>(null);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedRanchId, setSelectedRanchId] = useState<number | null>(null);
  
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
      addRegion({ region: regionFormData.name });
      setRegionFormData({ name: '' });
      setShowRegionForm(false);
    }
  };

  const handleSubmitRanch = () => {
    if (ranchFormData.name && selectedRegionId) {
      addRanch(selectedRegionId, { name: ranchFormData.name });
      setRanchFormData({ name: '' });
      resetForms();
    }
  };

  const handleSubmitLot = () => {
    if (lotFormData.number && lotFormData.acres && selectedRegionId && selectedRanchId) {
      addLot(selectedRegionId, selectedRanchId, {
        number: lotFormData.number,
        acres: parseFloat(lotFormData.acres),
        soilType: lotFormData.soilType,
        lastCrop: lotFormData.lastCrop,
        lastPlantDate: lotFormData.lastPlantDate,
        microclimate: lotFormData.microclimate
      });
      setLotFormData({
        number: '', 
        acres: '', 
        soilType: 'Sandy Loam', 
        lastCrop: '', 
        lastPlantDate: '', 
        microclimate: 'Moderate'
      });
      resetForms();
    }
  };

  const resetForms = () => {
    setShowRanchForm(false);
    setShowLotForm(false);
    setShowRegionForm(false);
    setEditingRanch(null);
    setEditingLot(null);
    setSelectedRegionId(null);
    setSelectedRanchId(null);
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
            
            <div className="p-4 space-y-4">
              {region.ranches.map(ranch => (
                <div key={ranch.id} className="border rounded-lg">
                  <div className="p-3 bg-blue-50 border-b">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-blue-900">🏪 {ranch.name}</h4>
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
                          className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                          onDragOver={(e) => handleDragOver(e, region.id, ranch.id, lot.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, region.id, ranch.id, lot.id)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-gray-900">Lot {lot.number}</div>
                            <div className="text-xs text-gray-600">{lot.acres} acres</div>
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

      {/* Region Form Modal */}
      <Modal
        isOpen={showRegionForm}
        onClose={resetForms}
        title="Add New Region"
        footer={
          <>
            <Button variant="secondary" onClick={resetForms}>Cancel</Button>
            <Button onClick={handleSubmitRegion}>Add Region</Button>
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
        title="Add New Ranch"
        footer={
          <>
            <Button variant="secondary" onClick={resetForms}>Cancel</Button>
            <Button onClick={handleSubmitRanch}>Add Ranch</Button>
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
        title="Add New Lot"
        footer={
          <>
            <Button variant="secondary" onClick={resetForms}>Cancel</Button>
            <Button onClick={handleSubmitLot}>Add Lot</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lot Number
              </label>
              <input
                type="text"
                placeholder="Lot number"
                value={lotFormData.number}
                onChange={(e) => setLotFormData({...lotFormData, number: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
              />
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
      {splitNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ✂️ Planting Split Required
            </h3>
            <div className="space-y-2 text-sm">
              <div><strong>Crop:</strong> {splitNotification.crop} - {splitNotification.variety}</div>
              <div><strong>Original Size:</strong> {splitNotification.originalAcres} acres</div>
              <div><strong>Assigned:</strong> {splitNotification.assignedAcres} acres to Lot {splitNotification.lotLocation}</div>
              <div><strong>Remaining:</strong> {splitNotification.remainingAcres} acres (unassigned)</div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={clearSplitNotification}>Got it</Button>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Results */}
      {optimizationResults && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🤖 Optimization Results
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-lg">{optimizationResults.summary.totalPlantings}</div>
                  <div className="text-gray-600">Total Plantings</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{optimizationResults.summary.successfulAssignments}</div>
                  <div className="text-gray-600">Assigned</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{optimizationResults.summary.averageScore}</div>
                  <div className="text-gray-600">Avg Score</div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={clearOptimizationResults}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
