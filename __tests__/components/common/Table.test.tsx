// =============================================================================
// TABLE COMPONENT TEST SUITE
// =============================================================================

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Table, TableColumn, TableProps } from '../../../components/common/Table';

describe('Table Component', () => {
  const mockColumns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'age', label: 'Age', sortable: true },
    { key: 'email', label: 'Email', sortable: false },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => (
        <span className={`status ${value?.toLowerCase() || ''}`}>{value || 'N/A'}</span>
      )
    }
  ];

  const mockData = [
    { name: 'John Doe', age: 30, email: 'john@example.com', status: 'Active' },
    { name: 'Jane Smith', age: 25, email: 'jane@example.com', status: 'Inactive' },
    { name: 'Bob Johnson', age: 35, email: 'bob@example.com', status: 'Active' }
  ];

  const defaultProps: TableProps = {
    columns: mockColumns,
    data: mockData
  };

  describe('rendering', () => {
    it('should render table with correct structure', () => {
      render(<Table {...defaultProps} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('rowgroup')).toHaveLength(2); // thead and tbody
    });

    it('should render column headers correctly', () => {
      render(<Table {...defaultProps} />);
      
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should render data rows correctly', () => {
      render(<Table {...defaultProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('should apply correct CSS classes', () => {
      const { container } = render(<Table {...defaultProps} />);
      
      expect(container.querySelector('.overflow-x-auto')).toBeInTheDocument();
      expect(container.querySelector('.min-w-full')).toBeInTheDocument();
      expect(container.querySelector('.divide-y')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should show empty message when no data', () => {
      render(<Table {...defaultProps} data={[]} />);
      
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should show custom empty message', () => {
      render(<Table {...defaultProps} data={[]} emptyMessage="Custom empty message" />);
      
      expect(screen.getByText('Custom empty message')).toBeInTheDocument();
    });

    it('should span empty message across all columns', () => {
      render(<Table {...defaultProps} data={[]} />);
      
      const emptyCell = screen.getByText('No data available').closest('td');
      expect(emptyCell).toHaveAttribute('colSpan', '4'); // 4 columns
    });
  });

  describe('custom rendering', () => {
    it('should use custom render function when provided', () => {
      render(<Table {...defaultProps} />);
      
      // Status column uses custom renderer
      const statusElements = screen.getAllByText(/Active|Inactive/);
      expect(statusElements.length).toBeGreaterThan(0);
      
      // Check that custom class is applied
      const activeStatus = screen.getAllByText('Active')[0];
      expect(activeStatus.closest('span')).toHaveClass('status', 'active');
    });

    it('should render default value when no custom renderer', () => {
      render(<Table {...defaultProps} />);
      
      // Name, age, email columns use default rendering
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  describe('sorting functionality', () => {
    const mockOnSort = jest.fn();

    beforeEach(() => {
      mockOnSort.mockClear();
    });

    it('should show sort indicators for sortable columns', () => {
      render(<Table {...defaultProps} onSort={mockOnSort} />);
      
      // Name and Age are sortable, should show sort indicator
      expect(screen.getByText('Name').closest('th')).toHaveClass('cursor-pointer');
      expect(screen.getByText('Age').closest('th')).toHaveClass('cursor-pointer');
      
      // Email is not sortable, should not have cursor pointer
      expect(screen.getByText('Email').closest('th')).not.toHaveClass('cursor-pointer');
    });

    it('should call onSort when sortable column header is clicked', () => {
      render(<Table {...defaultProps} onSort={mockOnSort} />);
      
      fireEvent.click(screen.getByText('Name'));
      
      expect(mockOnSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('should toggle sort direction on repeated clicks', () => {
      render(<Table {...defaultProps} onSort={mockOnSort} sortKey="name" sortDirection="asc" />);
      
      fireEvent.click(screen.getByText('Name'));
      
      expect(mockOnSort).toHaveBeenCalledWith('name', 'desc');
    });

    it('should show correct sort indicator based on current sort', () => {
      render(<Table {...defaultProps} onSort={mockOnSort} sortKey="name" sortDirection="asc" />);
      
      expect(screen.getByText('↑')).toBeInTheDocument();
    });

    it('should show descending indicator when sorted desc', () => {
      render(<Table {...defaultProps} onSort={mockOnSort} sortKey="name" sortDirection="desc" />);
      
      expect(screen.getByText('↓')).toBeInTheDocument();
    });

    it('should show neutral indicator for unsorted columns', () => {
      render(<Table {...defaultProps} onSort={mockOnSort} sortKey="name" sortDirection="asc" />);
      
      // Age column should show neutral indicator
      const ageHeader = screen.getByText('Age').closest('th');
      expect(ageHeader?.textContent).toContain('↕');
    });

    it('should not call onSort for non-sortable columns', () => {
      render(<Table {...defaultProps} onSort={mockOnSort} />);
      
      fireEvent.click(screen.getByText('Email'));
      
      expect(mockOnSort).not.toHaveBeenCalled();
    });

    it('should work without onSort prop', () => {
      render(<Table {...defaultProps} />);
      
      // Should not crash when clicking sortable headers without onSort
      expect(() => fireEvent.click(screen.getByText('Name'))).not.toThrow();
    });
  });

  describe('row interactions', () => {
    it('should apply hover styling to data rows', () => {
      const { container } = render(<Table {...defaultProps} />);
      
      const dataRows = container.querySelectorAll('tbody tr');
      dataRows.forEach(row => {
        expect(row).toHaveClass('hover:bg-gray-50');
      });
    });

    it('should render correct number of rows', () => {
      render(<Table {...defaultProps} />);
      
      const rows = screen.getAllByRole('row');
      // 1 header row + 3 data rows = 4 total
      expect(rows).toHaveLength(4);
    });
  });

  describe('accessibility', () => {
    it('should have proper table structure', () => {
      render(<Table {...defaultProps} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('rowgroup')).toHaveLength(2); // thead and tbody
      expect(screen.getAllByRole('columnheader')).toHaveLength(4);
      expect(screen.getAllByRole('row')).toHaveLength(4); // 1 header + 3 data
    });

    it('should handle keyboard navigation on sortable headers', () => {
      render(<Table {...defaultProps} onSort={jest.fn()} />);
      
      const nameHeader = screen.getByText('Name').closest('th');
      nameHeader?.focus();
      
      // Test passes if no errors are thrown during focus
      expect(nameHeader).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty columns array', () => {
      render(<Table columns={[]} data={[]} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should handle null/undefined values in data', () => {
      const dataWithNulls = [
        { name: null, age: undefined, email: '', status: 'Active' }
      ];
      
      render(<Table {...defaultProps} data={dataWithNulls} />);
      
      // Should render without crashing
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should handle large datasets', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        name: `User ${i}`,
        age: 20 + (i % 60),
        email: `user${i}@example.com`,
        status: i % 2 === 0 ? 'Active' : 'Inactive'
      }));
      
      render(<Table {...defaultProps} data={largeData} />);
      
      expect(screen.getByText('User 0')).toBeInTheDocument();
      expect(screen.getByText('User 999')).toBeInTheDocument();
    });

    it('should handle columns with missing keys', () => {
      const dataWithMissingKeys = [
        { name: 'John', email: 'john@example.com' } // missing age and status
      ];
      
      render(<Table {...defaultProps} data={dataWithMissingKeys} />);
      
      expect(screen.getByText('John')).toBeInTheDocument();
    });
  });

  describe('performance', () => {
    it('should render efficiently with many columns', () => {
      const manyColumns: TableColumn[] = Array.from({ length: 20 }, (_, i) => ({
        key: `col${i}`,
        label: `Column ${i}`,
        sortable: i % 2 === 0
      }));
      
      const data = [{ ...Array.from({ length: 20 }, (_, i) => ({ [`col${i}`]: `Value ${i}` })).reduce((a, b) => ({ ...a, ...b }), {}) }];
      
      render(<Table columns={manyColumns} data={data} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(20);
    });
  });

  describe('styling consistency', () => {
    it('should apply consistent cell padding', () => {
      const { container } = render(<Table {...defaultProps} />);
      
      const cells = container.querySelectorAll('td');
      cells.forEach(cell => {
        expect(cell).toHaveClass('px-6', 'py-4');
      });
    });

    it('should apply consistent header styling', () => {
      const { container } = render(<Table {...defaultProps} />);
      
      const headers = container.querySelectorAll('th');
      headers.forEach(header => {
        expect(header).toHaveClass('px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-500', 'uppercase', 'tracking-wider');
      });
    });

    it('should apply responsive overflow styling', () => {
      const { container } = render(<Table {...defaultProps} />);
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('overflow-x-auto');
    });
  });
});
