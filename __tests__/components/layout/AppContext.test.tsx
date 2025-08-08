import React from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import { AppProvider, useAppContext } from '@/components/layout/AppContext';

// Mock all the hooks
jest.mock('@/hooks/useOrders', () => ({
  useOrders: () => ({
    orders: [{ id: 1, customerName: 'Test Customer' }],
    addOrder: jest.fn(),
    updateOrder: jest.fn(),
    deleteOrder: jest.fn(),
  }),
}));

jest.mock('@/hooks/useCommodities', () => ({
  useCommodities: () => ({
    commodities: [{ id: 1, name: 'Test Commodity' }],
    addCommodity: jest.fn(),
    updateCommodity: jest.fn(),
    deleteCommodity: jest.fn(),
    addVariety: jest.fn(),
    updateVariety: jest.fn(),
    deleteVariety: jest.fn(),
    duplicateVariety: jest.fn(),
  }),
}));

jest.mock('@/hooks/usePlantings', () => ({
  usePlantings: () => ({
    plantings: [{ id: '1', variety: 'Test Variety' }],
    generatePlantings: jest.fn(),
    assignPlantingToLot: jest.fn(),
    unassignPlanting: jest.fn(),
    optimizeAllPlantings: jest.fn(),
    setLandStructure: jest.fn(),
  }),
}));

jest.mock('@/hooks/useLandManagement', () => ({
  useLandManagement: () => ({
    landStructure: [{ id: 1, name: 'Test Region' }],
    addRegion: jest.fn(),
    updateRegion: jest.fn(),
    deleteRegion: jest.fn(),
    addRanch: jest.fn(),
    updateRanch: jest.fn(),
    deleteRanch: jest.fn(),
    addLot: jest.fn(),
    updateLot: jest.fn(),
    deleteLot: jest.fn(),
    findLot: jest.fn(),
  }),
}));

jest.mock('@/hooks/useNotifications', () => ({
  useSplitNotifications: () => ({
    splitNotification: null,
    showSplitNotification: jest.fn(),
    clearSplitNotification: jest.fn(),
  }),
  useRecombineNotifications: () => ({
    recombineNotification: null,
    showRecombineNotification: jest.fn(),
    clearRecombineNotification: jest.fn(),
  }),
  useOptimizationResults: () => ({
    optimizationResults: null,
    isOptimizing: false,
    setIsOptimizing: jest.fn(),
    showOptimizationResults: jest.fn(),
    clearOptimizationResults: jest.fn(),
  }),
}));

jest.mock('@/hooks/useDragAndDrop', () => ({
  useDragAndDrop: () => ({
    handleDragStart: jest.fn(),
    handleDragEnd: jest.fn(),
    handleDragOver: jest.fn(),
    handleDrop: jest.fn(),
    handleDragLeave: jest.fn(),
  }),
}));

jest.mock('@/lib/services/csv', () => ({
  csvService: {
    exportPlantings: jest.fn(),
  },
}));

describe('AppContext', () => {
  describe('AppProvider', () => {
    it('should render children correctly', () => {
      render(
        <AppProvider>
          <div data-testid="test-child">Test Child</div>
        </AppProvider>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('should provide context value to children', () => {
      const TestComponent = () => {
        const context = useAppContext();
        return <div data-testid="has-context">{context ? 'true' : 'false'}</div>;
      };

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      expect(screen.getByTestId('has-context')).toHaveTextContent('true');
    });

    it('should provide all required data properties', () => {
      const TestComponent = () => {
        const { orders, commodities, landStructure, plantings } = useAppContext();
        return (
          <div>
            <div data-testid="orders-length">{orders.length}</div>
            <div data-testid="commodities-length">{commodities.length}</div>
            <div data-testid="land-length">{landStructure.length}</div>
            <div data-testid="plantings-length">{plantings.length}</div>
          </div>
        );
      };

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      expect(screen.getByTestId('orders-length')).toHaveTextContent('1');
      expect(screen.getByTestId('commodities-length')).toHaveTextContent('1');
      expect(screen.getByTestId('land-length')).toHaveTextContent('1');
      expect(screen.getByTestId('plantings-length')).toHaveTextContent('1');
    });

    it('should provide all action functions', () => {
      const TestComponent = () => {
        const {
          addOrder,
          updateOrder,
          deleteOrder,
          addCommodity,
          updateCommodity,
          deleteCommodity,
          addVariety,
          updateVariety,
          deleteVariety,
          duplicateVariety,
          addRegion,
          updateRegion,
          deleteRegion,
          addRanch,
          updateRanch,
          deleteRanch,
          addLot,
          updateLot,
          deleteLot,
          findLot,
          generatePlantings,
          assignPlantingToLot,
          unassignPlanting,
          optimizeAllPlantings,
        } = useAppContext();

        return (
          <div data-testid="all-functions-defined">
            {[
              addOrder,
              updateOrder,
              deleteOrder,
              addCommodity,
              updateCommodity,
              deleteCommodity,
              addVariety,
              updateVariety,
              deleteVariety,
              duplicateVariety,
              addRegion,
              updateRegion,
              deleteRegion,
              addRanch,
              updateRanch,
              deleteRanch,
              addLot,
              updateLot,
              deleteLot,
              findLot,
              generatePlantings,
              assignPlantingToLot,
              unassignPlanting,
              optimizeAllPlantings,
            ].every(fn => typeof fn === 'function') ? 'true' : 'false'}
          </div>
        );
      };

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      expect(screen.getByTestId('all-functions-defined')).toHaveTextContent('true');
    });

    it('should provide drag handlers', () => {
      const TestComponent = () => {
        const { dragHandlers } = useAppContext();
        return (
          <div data-testid="has-drag-handlers">
            {dragHandlers && typeof dragHandlers === 'object' ? 'true' : 'false'}
          </div>
        );
      };

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      expect(screen.getByTestId('has-drag-handlers')).toHaveTextContent('true');
    });

    it('should provide notification functions', () => {
      const TestComponent = () => {
        const {
          splitNotification,
          showSplitNotification,
          clearSplitNotification,
          recombineNotification,
          showRecombineNotification,
          clearRecombineNotification,
        } = useAppContext();

        return (
          <div>
            <div data-testid="split-notification">{splitNotification === null ? 'null' : 'exists'}</div>
            <div data-testid="has-split-functions">
              {typeof showSplitNotification === 'function' && typeof clearSplitNotification === 'function' ? 'true' : 'false'}
            </div>
            <div data-testid="recombine-notification">{recombineNotification === null ? 'null' : 'exists'}</div>
            <div data-testid="has-recombine-functions">
              {typeof showRecombineNotification === 'function' && typeof clearRecombineNotification === 'function' ? 'true' : 'false'}
            </div>
          </div>
        );
      };

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      expect(screen.getByTestId('split-notification')).toHaveTextContent('null');
      expect(screen.getByTestId('has-split-functions')).toHaveTextContent('true');
      expect(screen.getByTestId('recombine-notification')).toHaveTextContent('null');
      expect(screen.getByTestId('has-recombine-functions')).toHaveTextContent('true');
    });

    it('should provide optimization functions', () => {
      const TestComponent = () => {
        const {
          optimizationResults,
          isOptimizing,
          setIsOptimizing,
          showOptimizationResults,
          clearOptimizationResults,
        } = useAppContext();

        return (
          <div>
            <div data-testid="optimization-results">{optimizationResults === null ? 'null' : 'exists'}</div>
            <div data-testid="is-optimizing">{isOptimizing ? 'true' : 'false'}</div>
            <div data-testid="has-optimization-functions">
              {[setIsOptimizing, showOptimizationResults, clearOptimizationResults].every(fn => typeof fn === 'function') ? 'true' : 'false'}
            </div>
          </div>
        );
      };

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      expect(screen.getByTestId('optimization-results')).toHaveTextContent('null');
      expect(screen.getByTestId('is-optimizing')).toHaveTextContent('false');
      expect(screen.getByTestId('has-optimization-functions')).toHaveTextContent('true');
    });

    it('should provide export function', () => {
      const TestComponent = () => {
        const { handleExportCSV } = useAppContext();
        return (
          <div data-testid="has-export-function">
            {typeof handleExportCSV === 'function' ? 'true' : 'false'}
          </div>
        );
      };

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      expect(screen.getByTestId('has-export-function')).toHaveTextContent('true');
    });

    it('should handle multiple children', () => {
      render(
        <AppProvider>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </AppProvider>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });
  });

  describe('useAppContext', () => {
    it('should throw error when used outside of AppProvider', () => {
      const TestComponent = () => {
        useAppContext();
        return <div>Test</div>;
      };

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => render(<TestComponent />)).toThrow('useAppContext must be used within an AppProvider');

      console.error = originalError;
    });

    it('should return context value when used within AppProvider', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current.orders).toBeDefined();
      expect(result.current.commodities).toBeDefined();
      expect(result.current.landStructure).toBeDefined();
      expect(result.current.plantings).toBeDefined();
      expect(typeof result.current.addOrder).toBe('function');
      expect(typeof result.current.generatePlantings).toBe('function');
      expect(typeof result.current.handleExportCSV).toBe('function');
    });

    it('should provide stable context value across re-renders', () => {
      const { result, rerender } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      const firstRender = result.current;
      rerender();
      const secondRender = result.current;

      // Check that the structure is consistent
      expect(firstRender.orders).toEqual(secondRender.orders);
      expect(firstRender.commodities).toEqual(secondRender.commodities);
      expect(firstRender.landStructure).toEqual(secondRender.landStructure);
      expect(firstRender.plantings).toEqual(secondRender.plantings);
    });
  });
});
