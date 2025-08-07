// =============================================================================
// DATA MANAGEMENT FEATURE - Data export, import, and management tools
// =============================================================================

import React, { useState, useEffect } from 'react';
import { CheckCircle, Download, AlertTriangle } from 'lucide-react';
import { Button, Modal } from '../common';
import { persistenceService } from '@/lib/services/persistence';
import { STORAGE_KEYS } from '@/lib/constants';

export const DataManagementFeature: React.FC = () => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if any data exists
  const hasData = (): boolean => {
    if (typeof window === 'undefined') return false;
    return Object.values(STORAGE_KEYS)
      .some(key => localStorage.getItem(key) !== null);
  };

  const exportData = () => {
    try {
      const data = {
        orders: persistenceService.load(STORAGE_KEYS.ORDERS, []),
        commodities: persistenceService.load(STORAGE_KEYS.COMMODITIES, []),
        landStructure: persistenceService.load(STORAGE_KEYS.LAND_STRUCTURE, []),
        plantings: persistenceService.load(STORAGE_KEYS.PLANTINGS, []),
        activeTab: persistenceService.load(STORAGE_KEYS.ACTIVE_TAB, 'orders'),
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `crop-planning-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setLastBackup(new Date().toLocaleString());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Export failed: ' + errorMessage);
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') return;
        
        const data = JSON.parse(result);
        
        // Validate data structure
        if (!data.orders || !data.commodities || !data.landStructure) {
          throw new Error('Invalid backup file format');
        }

        // Import data
        persistenceService.save(STORAGE_KEYS.ORDERS, data.orders);
        persistenceService.save(STORAGE_KEYS.COMMODITIES, data.commodities);
        persistenceService.save(STORAGE_KEYS.LAND_STRUCTURE, data.landStructure);
        persistenceService.save(STORAGE_KEYS.PLANTINGS, data.plantings || []);
        
        if (data.activeTab) {
          persistenceService.save(STORAGE_KEYS.ACTIVE_TAB, data.activeTab);
        }

        alert('Data imported successfully! Please refresh the page to see changes.');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert('Import failed: ' + errorMessage);
      }
    };
    reader.readAsText(file);
    
    // Clear file input
    event.target.value = '';
  };

  const resetData = () => {
    persistenceService.clearAll();
    setShowResetConfirm(false);
    alert('All data has been reset! Please refresh the page to load default data.');
  };

  const resetConfirmFooter = (
    <>
      <Button 
        variant="secondary" 
        onClick={() => setShowResetConfirm(false)}
      >
        Cancel
      </Button>
      <Button 
        variant="danger" 
        onClick={resetData}
      >
        Yes, Reset All Data
      </Button>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Data Persistence Status</h2>
        
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Auto-Save Active</h3>
              <p className="text-sm text-green-700 mt-1">
                Your data is automatically saved to your browser's local storage as you work. 
                Changes to orders, commodities, land structure, and plantings are preserved between sessions.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Saved Data</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {isClient ? (
                <>
                  <div>• Orders: {persistenceService.load(STORAGE_KEYS.ORDERS, []).length} entries</div>
                  <div>• Commodities: {persistenceService.load(STORAGE_KEYS.COMMODITIES, []).length} types</div>
                  <div>• Land Areas: {persistenceService.load(STORAGE_KEYS.LAND_STRUCTURE, []).length} regions</div>
                  <div>• Plantings: {persistenceService.load(STORAGE_KEYS.PLANTINGS, []).length} entries</div>
                </>
              ) : (
                <>
                  <div>• Orders: Loading...</div>
                  <div>• Commodities: Loading...</div>
                  <div>• Land Areas: Loading...</div>
                  <div>• Plantings: Loading...</div>
                </>
              )}
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Browser Storage</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Storage Type: localStorage</div>
              <div>Status: {isClient ? (hasData() ? 'Active' : 'Empty') : 'Loading...'}</div>
              <div>Auto-backup: Enabled</div>
              {lastBackup && <div>Last Export: {lastBackup}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🛠️ Data Management Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📤 Export Data</h4>
            <p className="text-sm text-gray-600 mb-3">
              Download all your data as a JSON backup file.
            </p>
            <Button onClick={exportData} className="w-full">
              <Download size={16} />
              Export Backup
            </Button>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📥 Import Data</h4>
            <p className="text-sm text-gray-600 mb-3">
              Restore data from a previously exported backup file.
            </p>
            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
              <Button variant="secondary" className="w-full cursor-pointer">
                Select Backup File
              </Button>
            </label>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🔄 Reset Data</h4>
            <p className="text-sm text-gray-600 mb-3">
              Clear all saved data and return to defaults.
            </p>
            <Button 
              variant="danger" 
              onClick={() => setShowResetConfirm(true)}
              className="w-full"
            >
              <AlertTriangle size={16} />
              Reset All Data
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start">
          <div className="text-blue-600 mt-1 mr-3">💡</div>
          <div>
            <h3 className="text-sm font-medium text-blue-800">Data Storage Information</h3>
            <p className="text-sm text-blue-700 mt-1">
              This application uses your browser's localStorage to save data. Your information stays on your device and is not sent to any server. 
              Regular backups are recommended to prevent data loss when clearing browser data.
            </p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="⚠️ Confirm Data Reset"
        footer={resetConfirmFooter}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to reset all data? This will permanently delete:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>All orders and customer data</li>
            <li>Commodity and variety configurations</li>
            <li>Land structure and lot information</li>
            <li>Generated plantings and assignments</li>
          </ul>
          <p className="text-sm text-red-600 font-medium">
            This action cannot be undone. Consider exporting a backup first.
          </p>
        </div>
      </Modal>
    </div>
  );
};
