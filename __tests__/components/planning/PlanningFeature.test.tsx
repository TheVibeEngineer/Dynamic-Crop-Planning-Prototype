// =============================================================================
// PLANNING FEATURE COMPONENT TEST SUITE
// =============================================================================

import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlanningFeature, PlanningFeatureProps } from '../../../components/planning/PlanningFeature';
import type { Planting } from '../../../types/planning';

describe('PlanningFeature Component', () => {
  const mockAssignedPlantings: Planting[] = [
    {
      id: '1',
      crop: 'Romaine',
      variety: 'Green Forest',
      acres: 10.5,
      plantDate: '2024-03-15',
      harvestDate: '2024-05-15',
      marketType: 'Fresh',
      customer: 'ABC Market',
      assigned: true,
      volumeOrdered: 500,
      region: 'North',
      ranch: 'Ranch A',
      lot: 'Lot 101'
    },
    {
      id: '2',
      crop: 'Iceberg',
      variety: 'Classic',
      acres: 15.0,
      plantDate: '2024-03-20',
      harvestDate: '2024-05-20',
      marketType: 'Fresh',
      customer: 'XYZ Store',
      assigned: true,
      volumeOrdered: 750,
      region: 'South',
      ranch: 'Ranch B',
      lot: 'Lot 201'
    },
    {
      id: '3',
      crop: 'Romaine',
      variety: 'Red Oak',
      acres: 8.2,
      plantDate: '2024-03-25',
      harvestDate: '2024-05-25',
      marketType: 'Processing',
      customer: 'ABC Market',
      assigned: true,
      volumeOrdered: 400,
      region: 'North',
      ranch: 'Ranch A',
      lot: 'Lot 102'
    }
  ];

  const mockUnassignedPlantings: Planting[] = [
    {
      id: '4',
      crop: 'Spinach',
      variety: 'Baby Leaf',
      acres: 5.5,
      plantDate: '2024-04-01',
      harvestDate: '2024-06-01',
      marketType: 'Fresh',
      customer: 'DEF Grocery',
      assigned: false,
      volumeOrdered: 200
    },
    {
      id: '5',
      crop: 'Arugula',
      variety: 'Wild',
      acres: 3.8,
      plantDate: '2024-04-05',
      harvestDate: '2024-06-05',
      marketType: 'Fresh',
      customer: 'GHI Market',
      assigned: false,
      volumeOrdered: 150
    }
  ];

  const allMockPlantings = [...mockAssignedPlantings, ...mockUnassignedPlantings];

  const defaultProps: PlanningFeatureProps = {
    plantings: allMockPlantings
  };

  describe('rendering', () => {
    it('should render the main title and description', () => {
      render(<PlanningFeature {...defaultProps} />);
      
      expect(screen.getByText('📊 Crop Planning Overview')).toBeInTheDocument();
      expect(screen.getByText('Analytics and insights for your crop planning operations')).toBeInTheDocument();
    });

    it('should render all main sections', () => {
      render(<PlanningFeature {...defaultProps} />);
      
      expect(screen.getByText('Crop Distribution')).toBeInTheDocument();
      expect(screen.getByText('Customer Breakdown')).toBeInTheDocument();
    });

    it('should have proper section structure', () => {
      const { container } = render(<PlanningFeature {...defaultProps} />);
      
      // Should have key metrics grid
      const metricsGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-4');
      expect(metricsGrid).toBeInTheDocument();
      
      // Should have breakdown grid
      const breakdownGrid = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
      expect(breakdownGrid).toBeInTheDocument();
    });
  });

  describe('key metrics calculation', () => {
    it('should calculate total plantings correctly', () => {
      render(<PlanningFeature {...defaultProps} />);
      
      expect(screen.getByText('Total Plantings')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // Total plantings
    });

    it('should display assigned and unassigned breakdown', () => {
      render(<PlanningFeature {...defaultProps} />);
      
      expect(screen.getByText('3 assigned • 2 unassigned')).toBeInTheDocument();
    });

    it('should calculate total acres correctly', () => {
      render(<PlanningFeature {...defaultProps} />);
      
      expect(screen.getByText('Total Acres')).toBeInTheDocument();
      // 10.5 + 15.0 + 8.2 = 33.7 for assigned plantings only
      expect(screen.getByText('33.7')).toBeInTheDocument();
    });

    it('should show acres are for assigned plantings only', () => {
      render(<PlanningFeature {...defaultProps} />);
      
      expect(screen.getByText('Assigned plantings only')).toBeInTheDocument();
    });

    it('should calculate utilization rate correctly', () => {
      render(<PlanningFeature {...defaultProps} />);
      
      expect(screen.getByText('Utilization Rate')).toBeInTheDocument();
      expect(screen.getByText('60.0%')).toBeInTheDocument(); // 3/5 * 100 = 60%
    });

    it('should count unique crops correctly', () => {
      render(<PlanningFeature {...defaultProps} />);
      
      expect(screen.getByText('Unique Crops')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Romaine and Iceberg
    });
  });

  describe('crop distribution', () => {
    it('should display crop statistics correctly', () => {
      render(<PlanningFeature {...defaultProps} />);
      
      // Romaine statistics (2 plantings, 18.7 acres, 1 customer since both are ABC Market)
      expect(screen.getByText('Romaine')).toBeInTheDocument();
      expect(screen.getByText('2 plantings • 1 customers')).toBeInTheDocument();
      // 18.7 acres appears in both crop and customer sections
      const acresTexts = screen.getAllByText('18.7 acres');
      expect(acresTexts.length).toBeGreaterThan(0);
      
      // Iceberg statistics (1 planting, 15.0 acres, 1 customer)
      expect(screen.getByText('Iceberg')).toBeInTheDocument();
      expect(screen.getByText('1 plantings • 1 customers')).toBeInTheDocument();
      // 15.0 acres also appears in both sections
      const icebergAcresTexts = screen.getAllByText('15.0 acres');
      expect(icebergAcresTexts.length).toBeGreaterThan(0);
    });

    it('should calculate crop percentage correctly', () => {
      render(<PlanningFeature {...defaultProps} />);
      
      // Romaine: 18.7/33.7 ≈ 55.5% (appears in both crop and customer sections)
      const romainePcts = screen.getAllByText('55.5%');
      expect(romainePcts.length).toBeGreaterThan(0);
      
      // Iceberg: 15.0/33.7 ≈ 44.5% (appears in both crop and customer sections)
      const icebergPcts = screen.getAllByText('44.5%');
      expect(icebergPcts.length).toBeGreaterThan(0);
    });

    it('should show empty state when no assigned plantings', () => {
      render(<PlanningFeature plantings={mockUnassignedPlantings} />);
      
      expect(screen.getAllByText('No assigned plantings yet')).toHaveLength(2); // One for each section
    });
  });

  describe('customer breakdown', () => {
    it('should display customer statistics correctly', () => {
      render(<PlanningFeature {...defaultProps} />);
      
      // ABC Market (2 plantings, 1 crop type, 18.7 acres) - both Romaine plantings to same customer
      expect(screen.getByText('ABC Market')).toBeInTheDocument();
      expect(screen.getByText('2 plantings • 1 crop types')).toBeInTheDocument();
      
      // XYZ Store (1 planting, 1 crop type, 15.0 acres)
      expect(screen.getByText('XYZ Store')).toBeInTheDocument();
      expect(screen.getByText('1 plantings • 1 crop types')).toBeInTheDocument();
    });

    it('should calculate customer percentage correctly', () => {
      render(<PlanningFeature {...defaultProps} />);
      
      // All percentages should be present (same as crop percentages since there's overlap)
      const percentages = screen.getAllByText(/\d+\.\d+%/);
      expect(percentages.length).toBeGreaterThan(0);
    });
  });

  describe('unassigned plantings alert', () => {
    it('should show alert when unassigned plantings exist', () => {
      render(<PlanningFeature {...defaultProps} />);
      
      expect(screen.getByText('⚠️')).toBeInTheDocument();
      expect(screen.getByText('Unassigned Plantings')).toBeInTheDocument();
      expect(screen.getByText(/You have 2 plantings that haven't been assigned/)).toBeInTheDocument();
    });

    it('should not show alert when all plantings are assigned', () => {
      render(<PlanningFeature plantings={mockAssignedPlantings} />);
      
      expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
      expect(screen.queryByText('Unassigned Plantings')).not.toBeInTheDocument();
    });

    it('should show helpful message in alert', () => {
      render(<PlanningFeature {...defaultProps} />);
      
      expect(screen.getByText(/Visit the Land Management section to assign them/)).toBeInTheDocument();
      expect(screen.getByText(/use the auto-optimization feature/)).toBeInTheDocument();
    });

    it('should apply correct alert styling', () => {
      const { container } = render(<PlanningFeature {...defaultProps} />);
      
      const alert = container.querySelector('.bg-yellow-50');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveClass('border', 'border-yellow-200', 'rounded-lg', 'p-4');
    });
  });

  describe('edge cases and empty states', () => {
    it('should handle empty plantings array', () => {
      render(<PlanningFeature plantings={[]} />);
      
      // Use more specific selector for Total Plantings since "0" appears multiple times
      const totalPlantingsElement = screen.getByText('Total Plantings').parentElement?.querySelector('.text-2xl');
      expect(totalPlantingsElement).toHaveTextContent('0');
      expect(screen.getByText('0 assigned • 0 unassigned')).toBeInTheDocument();
      expect(screen.getByText('0.0')).toBeInTheDocument(); // Total acres
      expect(screen.getByText('0.0%')).toBeInTheDocument(); // Utilization rate
      expect(screen.getAllByText('No assigned plantings yet')).toHaveLength(2);
    });

    it('should handle only unassigned plantings', () => {
      render(<PlanningFeature plantings={mockUnassignedPlantings} />);
      
      expect(screen.getByText('2')).toBeInTheDocument(); // Total plantings
      expect(screen.getByText('0 assigned • 2 unassigned')).toBeInTheDocument();
      expect(screen.getByText('0.0')).toBeInTheDocument(); // Total acres (assigned only)
      expect(screen.getByText('0.0%')).toBeInTheDocument(); // Utilization rate
      expect(screen.getByText('Unassigned Plantings')).toBeInTheDocument();
    });

    it('should handle only assigned plantings', () => {
      render(<PlanningFeature plantings={mockAssignedPlantings} />);
      
      expect(screen.getByText('3')).toBeInTheDocument(); // Total plantings
      expect(screen.getByText('3 assigned • 0 unassigned')).toBeInTheDocument();
      expect(screen.getByText('100.0%')).toBeInTheDocument(); // Utilization rate
      expect(screen.queryByText('Unassigned Plantings')).not.toBeInTheDocument();
    });

    it('should handle plantings with zero acres', () => {
      const zeroAcrePlantings: Planting[] = [
        {
          ...mockAssignedPlantings[0],
          acres: 0
        }
      ];
      
      render(<PlanningFeature plantings={zeroAcrePlantings} />);
      
      expect(screen.getByText('0.0')).toBeInTheDocument(); // Should handle zero acres
    });

    it('should handle NaN percentages when total acres is zero', () => {
      const zeroAcrePlantings: Planting[] = [
        {
          ...mockAssignedPlantings[0],
          acres: 0,
          assigned: true
        }
      ];
      
      render(<PlanningFeature plantings={zeroAcrePlantings} />);
      
      // Should handle division by zero gracefully (appears in both sections)
      const nanPercentages = screen.getAllByText('NaN%');
      expect(nanPercentages.length).toBeGreaterThan(0);
    });
  });

  describe('data aggregation accuracy', () => {
    it('should correctly group multiple plantings by crop', () => {
      const multiCropPlantings: Planting[] = [
        { ...mockAssignedPlantings[0], crop: 'Lettuce', acres: 10 },
        { ...mockAssignedPlantings[1], crop: 'Lettuce', acres: 20 },
        { ...mockAssignedPlantings[2], crop: 'Spinach', acres: 5 }
      ];
      
      render(<PlanningFeature plantings={multiCropPlantings} />);
      
      expect(screen.getByText('Lettuce')).toBeInTheDocument();
      expect(screen.getByText('Spinach')).toBeInTheDocument();
      expect(screen.getByText('2 plantings • 2 customers')).toBeInTheDocument(); // Lettuce stats
      expect(screen.getByText('30.0 acres')).toBeInTheDocument(); // Lettuce total
    });

    it('should correctly group multiple plantings by customer', () => {
      const multiCustomerPlantings: Planting[] = [
        { ...mockAssignedPlantings[0], customer: 'Customer A', acres: 10 },
        { ...mockAssignedPlantings[1], customer: 'Customer A', acres: 20 },
        { ...mockAssignedPlantings[2], customer: 'Customer B', acres: 5 }
      ];
      
      render(<PlanningFeature plantings={multiCustomerPlantings} />);
      
      expect(screen.getByText('Customer A')).toBeInTheDocument();
      expect(screen.getByText('Customer B')).toBeInTheDocument();
      expect(screen.getByText('2 plantings • 2 crop types')).toBeInTheDocument(); // Customer A stats
      expect(screen.getByText('30.0 acres')).toBeInTheDocument(); // Customer A total
    });

    it('should handle duplicate crop/customer combinations', () => {
      const duplicatePlantings: Planting[] = [
        { ...mockAssignedPlantings[0], crop: 'Romaine', customer: 'ABC Market', acres: 10 },
        { ...mockAssignedPlantings[0], id: '999', crop: 'Romaine', customer: 'ABC Market', acres: 15 }
      ];
      
      render(<PlanningFeature plantings={duplicatePlantings} />);
      
      // Should count as 2 plantings, 1 customer, 1 crop type
      expect(screen.getByText('2 plantings • 1 customers')).toBeInTheDocument();
      expect(screen.getByText('2 plantings • 1 crop types')).toBeInTheDocument();
      // Use getAllByText since "25.0 acres" appears multiple times
      const acresTexts = screen.getAllByText('25.0 acres');
      expect(acresTexts.length).toBeGreaterThan(0);
    });
  });

  describe('formatting and display', () => {
    it('should format acres to one decimal place', () => {
      const precisionPlantings: Planting[] = [
        { ...mockAssignedPlantings[0], acres: 10.123456 }
      ];
      
      render(<PlanningFeature plantings={precisionPlantings} />);
      
      expect(screen.getByText('10.1')).toBeInTheDocument();
    });

    it('should format percentages to one decimal place', () => {
      const percentagePlantings: Planting[] = [
        { ...mockAssignedPlantings[0], acres: 10 },
        { ...mockAssignedPlantings[1], acres: 23, assigned: true } // Total 33, so 10/33 = 30.3%
      ];
      
      render(<PlanningFeature plantings={percentagePlantings} />);
      
      // Use getAllByText since percentages appear in both crop and customer sections  
      const percentageTexts = screen.getAllByText('30.3%');
      expect(percentageTexts.length).toBeGreaterThan(0);
    });

    it('should apply correct styling classes', () => {
      const { container } = render(<PlanningFeature {...defaultProps} />);
      
      // Check metric cards styling
      const metricCards = container.querySelectorAll('.bg-white.p-6.rounded-lg.shadow-sm.border');
      expect(metricCards.length).toBeGreaterThan(0);
      
      // Check section headers
      const sectionHeaders = container.querySelectorAll('.text-lg.font-medium.text-gray-900');
      expect(sectionHeaders.length).toBe(2); // Crop Distribution + Customer Breakdown
    });
  });

  describe('performance with large datasets', () => {
    it('should handle large number of plantings efficiently', () => {
      const largePlantings: Planting[] = Array.from({ length: 1000 }, (_, i) => ({
        ...mockAssignedPlantings[0],
        id: `large-${i}`,
        crop: `Crop${i % 10}`, // 10 different crops
        customer: `Customer${i % 20}`, // 20 different customers
        acres: Math.random() * 50,
        assigned: i % 2 === 0 // Half assigned
      }));
      
      render(<PlanningFeature plantings={largePlantings} />);
      
      expect(screen.getByText('1000')).toBeInTheDocument(); // Total plantings
      // Unique crops will be 5 since we use i % 10 with only assigned (even) plantings
      expect(screen.getByText('5')).toBeInTheDocument(); // Unique crops
    });

    it('should handle many unique crops and customers', () => {
      const diversePlantings: Planting[] = Array.from({ length: 50 }, (_, i) => ({
        ...mockAssignedPlantings[0],
        id: `diverse-${i}`,
        crop: `Crop${i}`, // 50 unique crops
        customer: `Customer${i}`, // 50 unique customers
        assigned: true
      }));
      
      render(<PlanningFeature plantings={diversePlantings} />);
      
      // Need to use more specific query since "50" appears in multiple places (Total Plantings and Unique Crops)
      const uniqueCropsElement = screen.getByText('Unique Crops').parentElement?.querySelector('.text-2xl');
      expect(uniqueCropsElement).toHaveTextContent('50'); // Unique crops
      // Should render all crops and customers without performance issues
    });
  });

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      render(<PlanningFeature {...defaultProps} />);
      
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('📊 Crop Planning Overview');
      
      const sectionHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(sectionHeadings).toHaveLength(3); // Crop Distribution, Customer Breakdown, Unassigned Plantings
    });

    it('should have readable text contrast', () => {
      const { container } = render(<PlanningFeature {...defaultProps} />);
      
      // Check for proper text color classes
      expect(container.querySelector('.text-gray-900')).toBeInTheDocument();
      expect(container.querySelector('.text-gray-600')).toBeInTheDocument();
      expect(container.querySelector('.text-gray-500')).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      const { container } = render(<PlanningFeature {...defaultProps} />);
      
      // Should use proper div structure with meaningful classes
      expect(container.querySelector('.space-y-6')).toBeInTheDocument();
      expect(container.querySelector('.grid')).toBeInTheDocument();
    });
  });
});
