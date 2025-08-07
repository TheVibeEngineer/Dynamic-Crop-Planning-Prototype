// =============================================================================
// COMMODITIES FEATURE - Commodity and variety management interface
// =============================================================================

import React, { useState } from 'react';
import type { Commodity, Variety } from '@/types/commodities';
import { Button, Modal } from '../common';
import { MARKET_TYPES, BED_SIZES, PLANT_TYPES } from '@/lib/constants';

export interface CommoditiesFeatureProps {
  commodities: Commodity[];
  onAddVariety: (commodityName: string, varietyData: Partial<Variety>) => void;
  onUpdateVariety: (commodityName: string, varietyId: number, varietyData: Partial<Variety>) => void;
  onDeleteVariety: (commodityName: string, varietyId: number) => void;
}

export const CommoditiesFeature: React.FC<CommoditiesFeatureProps> = ({ 
  commodities, 
  onAddVariety, 
  onUpdateVariety, 
  onDeleteVariety 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingVariety, setEditingVariety] = useState<Variety | null>(null);
  const [editingCommodityName, setEditingCommodityName] = useState<string | null>(null);
  const [formData, setFormData] = useState({
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

  const handleAddVariety = (commodityName: string) => {
    setEditingCommodityName(commodityName);
    setEditingVariety(null);
    setFormData({
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
    setShowForm(true);
  };

  const handleEditVariety = (commodityName: string, variety: Variety) => {
    setEditingCommodityName(commodityName);
    setEditingVariety(variety);
    setFormData({
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
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (formData.name && editingCommodityName) {
      if (editingVariety) {
        onUpdateVariety(editingCommodityName, editingVariety.id, formData);
      } else {
        onAddVariety(editingCommodityName, formData);
      }
      resetForm();
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingVariety(null);
    setEditingCommodityName(null);
  };

  const handleMarketTypeChange = (marketType: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        marketTypes: [...formData.marketTypes, marketType]
      });
    } else {
      setFormData({
        ...formData,
        marketTypes: formData.marketTypes.filter(mt => mt !== marketType)
      });
    }
  };

  const formFooter = (
    <>
      <Button variant="secondary" onClick={resetForm}>
        Cancel
      </Button>
      <Button onClick={handleSubmit}>
        {editingVariety ? 'Update Variety' : 'Add Variety'}
      </Button>
    </>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Commodities & Varieties</h2>

      <div className="space-y-4">
        {commodities.map(commodity => (
          <div key={commodity.id} className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{commodity.name}</h3>
              <Button 
                variant="secondary" 
                onClick={() => handleAddVariety(commodity.name)}
                className="text-sm"
              >
                Add Variety
              </Button>
            </div>
            
            {commodity.varieties.map((variety) => (
              <div key={variety.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-gray-800">{variety.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      variety.plantType.toLowerCase() === 'transplant' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {formatPlantType(variety.plantType)}
                    </span>
                    <div className="flex gap-1">
                      {variety.marketTypes.map(marketType => (
                        <span key={marketType} className={`px-2 py-1 text-xs rounded-full ${
                          marketType === 'Fresh Cut' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {marketType}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleEditVariety(commodity.name, variety)}
                      className="text-xs px-2 py-1"
                    >
                      Edit
                    </Button>
                    {commodity.varieties.length > 1 && (
                      <Button
                        variant="danger"
                        onClick={() => onDeleteVariety(commodity.name, variety.id)}
                        className="text-xs px-2 py-1"
                      >
                        Delete
                      </Button>
                    )}
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
        ))}
      </div>

      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingVariety ? `Edit Variety: ${editingVariety.name}` : 'Add New Variety'}
        footer={formFooter}
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
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                  value={formData.growingWindow.start}
                  onChange={(e) => setFormData({
                    ...formData,
                    growingWindow: { ...formData.growingWindow, start: e.target.value }
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
                  value={formData.growingWindow.end}
                  onChange={(e) => setFormData({
                    ...formData,
                    growingWindow: { ...formData.growingWindow, end: e.target.value }
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
                value={formData.daysToHarvest}
                onChange={(e) => setFormData({
                  ...formData,
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
                value={formData.idealStand}
                onChange={(e) => setFormData({
                  ...formData,
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
                value={formData.plantType}
                onChange={(e) => setFormData({...formData, plantType: e.target.value})}
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
                value={formData.bedSize}
                onChange={(e) => setFormData({...formData, bedSize: e.target.value})}
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
                    checked={formData.marketTypes.includes(marketType)}
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
                  value={formData.budgetYieldPerAcre['Fresh Cut']}
                  onChange={(e) => setFormData({
                    ...formData,
                    budgetYieldPerAcre: {
                      ...formData.budgetYieldPerAcre,
                      'Fresh Cut': parseInt(e.target.value) || 0
                    }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                  disabled={!formData.marketTypes.includes('Fresh Cut')}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Bulk (lbs/acre)</label>
                <input
                  type="number"
                  value={formData.budgetYieldPerAcre['Bulk']}
                  onChange={(e) => setFormData({
                    ...formData,
                    budgetYieldPerAcre: {
                      ...formData.budgetYieldPerAcre,
                      'Bulk': parseInt(e.target.value) || 0
                    }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                  disabled={!formData.marketTypes.includes('Bulk')}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
