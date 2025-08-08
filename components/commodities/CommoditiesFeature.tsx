// =============================================================================
// COMMODITIES FEATURE - Commodity and variety management interface
// =============================================================================

import React, { useState } from 'react';
import type { Commodity, Variety } from '@/types/commodities';
import { Button, Modal } from '../common';
import { Edit, Trash2, Copy, Plus } from 'lucide-react';
import { MARKET_TYPES, BED_SIZES, PLANT_TYPES } from '@/lib/constants';

export interface CommoditiesFeatureProps {
  commodities: Commodity[];
  onAddCommodity: (commodityData: Partial<Commodity>) => void;
  onUpdateCommodity: (commodityId: number, commodityData: Partial<Commodity>) => void;
  onDeleteCommodity: (commodityId: number) => void;
  onAddVariety: (commodityName: string, varietyData: Partial<Variety>) => void;
  onUpdateVariety: (commodityName: string, varietyId: number, varietyData: Partial<Variety>) => void;
  onDeleteVariety: (commodityName: string, varietyId: number) => void;
  onDuplicateVariety: (commodityName: string, varietyId: number) => void;
}

export const CommoditiesFeature: React.FC<CommoditiesFeatureProps> = ({ 
  commodities, 
  onAddCommodity,
  onUpdateCommodity,
  onDeleteCommodity,
  onAddVariety, 
  onUpdateVariety, 
  onDeleteVariety,
  onDuplicateVariety
}) => {
  // Form states
  const [showCommodityForm, setShowCommodityForm] = useState(false);
  const [showVarietyForm, setShowVarietyForm] = useState(false);
  const [editingCommodity, setEditingCommodity] = useState<Commodity | null>(null);
  const [editingVariety, setEditingVariety] = useState<Variety | null>(null);
  const [editingCommodityName, setEditingCommodityName] = useState<string | null>(null);
  
  // Confirmation states for deletions
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'commodity' | 'variety';
    id: number;
    name: string;
    commodityName?: string;
  } | null>(null);
  
  // Commodity form data
  const [commodityFormData, setCommodityFormData] = useState({
    name: ''
  });
  
  // Variety form data  
  const [varietyFormData, setVarietyFormData] = useState({
    name: '', 
    growingWindow: { start: 'Jan', end: 'Dec' }, 
    daysToHarvest: 60, 
    bedSize: '38-2', 
    spacing: '12in',
    plantType: 'Transplant', 
    idealStand: 30000, 
    marketTypes: ['Fresh Cut'],
    budgetYieldPerAcre: { 'Fresh Cut': 1000, 'Bulk': 0 },
    preferences: { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0 }
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Helper function to properly capitalize plant types
  const formatPlantType = (plantType: string): string => {
    // Handle common variations and ensure proper capitalization
    switch (plantType.toLowerCase()) {
      case 'transplant':
        return 'Transplant';
      case 'direct seed':
      case 'directseed':
      case 'direct-seed':
        return 'Direct Seed';
      case 'both':
        return 'Both';
      default:
        // Fallback: capitalize first letter of each word
        return plantType
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
    }
  };

  // Commodity handlers
  const handleAddCommodity = () => {
    setCommodityFormData({ name: '' });
    setShowCommodityForm(true);
  };

  const handleEditCommodity = (commodity: Commodity) => {
    setEditingCommodity(commodity);
    setCommodityFormData({ name: commodity.name });
    setShowCommodityForm(true);
  };

  const handleSubmitCommodity = () => {
    if (commodityFormData.name) {
      if (editingCommodity) {
        onUpdateCommodity(editingCommodity.id, { name: commodityFormData.name });
      } else {
        onAddCommodity({ name: commodityFormData.name });
      }
      resetCommodityForm();
    }
  };

  const resetCommodityForm = () => {
    setShowCommodityForm(false);
    setEditingCommodity(null);
    setCommodityFormData({ name: '' });
  };

  // Variety handlers
  const handleAddVariety = (commodityName: string) => {
    setEditingCommodityName(commodityName);
    setEditingVariety(null);
    setVarietyFormData({
      name: '', 
      growingWindow: { start: 'Jan', end: 'Dec' }, 
      daysToHarvest: 60, 
      bedSize: '38-2', 
      spacing: '12in',
      plantType: 'Transplant', 
      idealStand: 30000, 
      marketTypes: ['Fresh Cut'],
      budgetYieldPerAcre: { 'Fresh Cut': 1000, 'Bulk': 0 },
      preferences: { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0 }
    });
    setShowVarietyForm(true);
  };

  const handleEditVariety = (commodityName: string, variety: Variety) => {
    setEditingCommodityName(commodityName);
    setEditingVariety(variety);
    setVarietyFormData({
      name: variety.name,
      growingWindow: variety.growingWindow,
      daysToHarvest: variety.daysToHarvest,
      bedSize: variety.bedSize,
      spacing: variety.spacing,
      plantType: variety.plantType,
      idealStand: variety.idealStand,
      marketTypes: variety.marketTypes,
      budgetYieldPerAcre: { 'Fresh Cut': variety.budgetYieldPerAcre['Fresh Cut'] || 0, 'Bulk': variety.budgetYieldPerAcre['Bulk'] || 0 },
      preferences: { 
        Jan: variety.preferences['Jan'] || 0, Feb: variety.preferences['Feb'] || 0, Mar: variety.preferences['Mar'] || 0, 
        Apr: variety.preferences['Apr'] || 0, May: variety.preferences['May'] || 0, Jun: variety.preferences['Jun'] || 0, 
        Jul: variety.preferences['Jul'] || 0, Aug: variety.preferences['Aug'] || 0, Sep: variety.preferences['Sep'] || 0, 
        Oct: variety.preferences['Oct'] || 0, Nov: variety.preferences['Nov'] || 0, Dec: variety.preferences['Dec'] || 0 
      }
    });
    setShowVarietyForm(true);
  };

  const handleSubmitVariety = () => {
    if (varietyFormData.name && editingCommodityName) {
      if (editingVariety) {
        onUpdateVariety(editingCommodityName, editingVariety.id, varietyFormData);
      } else {
        onAddVariety(editingCommodityName, varietyFormData);
      }
      resetVarietyForm();
    }
  };

  const resetVarietyForm = () => {
    setShowVarietyForm(false);
    setEditingVariety(null);
    setEditingCommodityName(null);
  };

  const resetForms = () => {
    resetCommodityForm();
    resetVarietyForm();
  };

  // Delete confirmation handlers
  const handleDeleteConfirm = (type: 'commodity' | 'variety', id: number, name: string, commodityName?: string) => {
    setConfirmDelete({ type, id, name, commodityName });
  };

  const executeDelete = () => {
    if (!confirmDelete) return;

    switch (confirmDelete.type) {
      case 'commodity':
        onDeleteCommodity(confirmDelete.id);
        break;
      case 'variety':
        if (confirmDelete.commodityName) {
          onDeleteVariety(confirmDelete.commodityName, confirmDelete.id);
        }
        break;
    }
    setConfirmDelete(null);
  };

  const handleMarketTypeChange = (marketType: string, checked: boolean) => {
    if (checked) {
      setVarietyFormData({
        ...varietyFormData,
        marketTypes: [...varietyFormData.marketTypes, marketType]
      });
    } else {
      setVarietyFormData({
        ...varietyFormData,
        marketTypes: varietyFormData.marketTypes.filter(mt => mt !== marketType)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Commodities & Varieties Management</h2>
        <Button onClick={handleAddCommodity}>
          <Plus size={16} />
          Add Commodity
        </Button>
      </div>

      <div className="space-y-4">
        {commodities.map(commodity => (
          <div key={commodity.id} className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">🥬 {commodity.name}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCommodity(commodity)}
                    className="text-xs p-2"
                    title="Edit Commodity"
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteConfirm('commodity', commodity.id, commodity.name)}
                    className="text-xs p-2 text-red-600 hover:text-red-700"
                    title="Delete Commodity"
                  >
                    <Trash2 size={14} />
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => handleAddVariety(commodity.name)}
                    className="text-sm"
                  >
                    Add Variety
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {commodity.varieties.map((variety) => (
                <div key={variety.id} className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-blue-900">🌱 {variety.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        variety.plantType.toLowerCase() === 'transplant' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {formatPlantType(variety.plantType)}
                      </span>
                      <div className="flex gap-1">
                        {variety.marketTypes.map(marketType => (
                          <span key={marketType} className={`px-2 py-1 text-xs rounded-full ${
                            marketType === 'Fresh Cut' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {marketType}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditVariety(commodity.name, variety)}
                        className="text-xs p-1"
                        title="Edit Variety"
                      >
                        <Edit size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDuplicateVariety(commodity.name, variety.id)}
                        className="text-xs p-1 text-blue-600 hover:text-blue-700"
                        title="Duplicate Variety"
                      >
                        <Copy size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteConfirm('variety', variety.id, variety.name, commodity.name)}
                        className="text-xs p-1 text-red-600 hover:text-red-700"
                        title="Delete Variety"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-700">Growing Window:</span>
                      <div className="font-medium text-gray-900">{variety.growingWindow.start} - {variety.growingWindow.end}</div>
                    </div>
                    <div>
                      <span className="text-gray-700">Days to Harvest:</span>
                      <div className="font-medium text-gray-900">{variety.daysToHarvest} days</div>
                    </div>
                    <div>
                      <span className="text-gray-700">Bed Size:</span>
                      <div className="font-medium text-gray-900">{variety.bedSize}</div>
                    </div>
                    <div>
                      <span className="text-gray-700">Ideal Stand/Acre:</span>
                      <div className="font-medium text-gray-900">{variety.idealStand.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    {variety.marketTypes.includes('Fresh Cut') && variety.budgetYieldPerAcre['Fresh Cut'] > 0 && (
                      <div>
                        <span className="text-gray-700">Fresh Cut Yield:</span>
                        <div className="font-medium text-gray-900">{variety.budgetYieldPerAcre['Fresh Cut'].toLocaleString()} cartons/acre</div>
                      </div>
                    )}
                    {variety.marketTypes.includes('Bulk') && variety.budgetYieldPerAcre['Bulk'] > 0 && (
                      <div>
                        <span className="text-gray-700">Bulk Yield:</span>
                        <div className="font-medium text-gray-900">{variety.budgetYieldPerAcre['Bulk'].toLocaleString()} lbs/acre</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Commodity Form Modal */}
      <Modal
        isOpen={showCommodityForm}
        onClose={resetForms}
        title={editingCommodity ? "Edit Commodity" : "Add New Commodity"}
        footer={
          <>
            <Button variant="secondary" onClick={resetForms}>Cancel</Button>
            <Button onClick={handleSubmitCommodity}>
              {editingCommodity ? "Update Commodity" : "Add Commodity"}
            </Button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Commodity Name
          </label>
          <input
            type="text"
            placeholder="Commodity name (e.g., Lettuce, Carrots)"
            value={commodityFormData.name}
            onChange={(e) => setCommodityFormData({ name: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>
      </Modal>

      {/* Variety Form Modal */}
      <Modal
        isOpen={showVarietyForm}
        onClose={resetForms}
        title={editingVariety ? `Edit Variety: ${editingVariety.name}` : 'Add New Variety'}
        footer={
          <>
            <Button variant="secondary" onClick={resetForms}>Cancel</Button>
            <Button onClick={handleSubmitVariety}>
              {editingVariety ? 'Update Variety' : 'Add Variety'}
            </Button>
          </>
        }
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Variety Name
            </label>
            <input
              type="text"
              placeholder="Variety Name"
              value={varietyFormData.name}
              onChange={(e) => setVarietyFormData({...varietyFormData, name: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Growing Window
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start Month</label>
                <select
                  value={varietyFormData.growingWindow.start}
                  onChange={(e) => setVarietyFormData({
                    ...varietyFormData,
                    growingWindow: { ...varietyFormData.growingWindow, start: e.target.value }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End Month</label>
                <select
                  value={varietyFormData.growingWindow.end}
                  onChange={(e) => setVarietyFormData({
                    ...varietyFormData,
                    growingWindow: { ...varietyFormData.growingWindow, end: e.target.value }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Days to Harvest
              </label>
              <input
                type="number"
                placeholder="Days to Harvest"
                value={varietyFormData.daysToHarvest}
                onChange={(e) => setVarietyFormData({
                  ...varietyFormData,
                  daysToHarvest: parseInt(e.target.value) || 60
                })}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ideal Stand per Acre
              </label>
              <input
                type="number"
                placeholder="Ideal Stand per Acre"
                value={varietyFormData.idealStand}
                onChange={(e) => setVarietyFormData({
                  ...varietyFormData,
                  idealStand: parseInt(e.target.value) || 30000
                })}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plant Type
              </label>
              <select
                value={varietyFormData.plantType}
                onChange={(e) => setVarietyFormData({...varietyFormData, plantType: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
              >
                {PLANT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bed Size
              </label>
              <select
                value={varietyFormData.bedSize}
                onChange={(e) => setVarietyFormData({...varietyFormData, bedSize: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
              >
                {BED_SIZES.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Market Types</label>
            <div className="flex gap-4">
              {MARKET_TYPES.slice(0, 2).map(marketType => (
                <label key={marketType} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={varietyFormData.marketTypes.includes(marketType)}
                    onChange={(e) => handleMarketTypeChange(marketType, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{marketType}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget Yields per Acre</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Fresh Cut (cartons/acre)</label>
                <input
                  type="number"
                  value={varietyFormData.budgetYieldPerAcre['Fresh Cut']}
                  onChange={(e) => setVarietyFormData({
                    ...varietyFormData,
                    budgetYieldPerAcre: {
                      ...varietyFormData.budgetYieldPerAcre,
                      'Fresh Cut': parseInt(e.target.value) || 0
                    }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                  disabled={!varietyFormData.marketTypes.includes('Fresh Cut')}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Bulk (lbs/acre)</label>
                <input
                  type="number"
                  value={varietyFormData.budgetYieldPerAcre['Bulk']}
                  onChange={(e) => setVarietyFormData({
                    ...varietyFormData,
                    budgetYieldPerAcre: {
                      ...varietyFormData.budgetYieldPerAcre,
                      'Bulk': parseInt(e.target.value) || 0
                    }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                  disabled={!varietyFormData.marketTypes.includes('Bulk')}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>

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
                Delete {confirmDelete.type === 'commodity' ? 'Commodity' : 'Variety'}
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-gray-700">
              Are you sure you want to delete{' '}
              <span className="font-medium">{confirmDelete.name}</span>?
            </p>
            {confirmDelete.type === 'commodity' && (
              <p className="text-sm text-red-600">
                ⚠️ This will also delete all varieties within this commodity.
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
