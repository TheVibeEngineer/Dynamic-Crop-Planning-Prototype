// =============================================================================
// USE NOTIFICATIONS HOOKS - Notification state management
// =============================================================================

import { useState } from 'react';
import type { SplitNotification, OptimizationResults } from '@/types';

export const useSplitNotifications = () => {
  const [splitNotification, setSplitNotification] = useState<SplitNotification | null>(null);

  const showSplitNotification = (notification: SplitNotification) => {
    setSplitNotification(notification);
  };

  const clearSplitNotification = () => {
    setSplitNotification(null);
  };

  return { splitNotification, showSplitNotification, clearSplitNotification };
};

export const useOptimizationResults = () => {
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResults | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const showOptimizationResults = (results: OptimizationResults) => {
    setOptimizationResults(results);
  };

  const clearOptimizationResults = () => {
    setOptimizationResults(null);
  };

  return { 
    optimizationResults, 
    isOptimizing, 
    setIsOptimizing,
    showOptimizationResults, 
    clearOptimizationResults 
  };
};
