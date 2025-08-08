// =============================================================================
// ORDERS FEATURE COMPONENT TEST SUITE
// =============================================================================

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrdersFeature, OrdersFeatureProps } from '../../../components/orders/OrdersFeature';
import type { Order } from '../../../types/orders';
import type { Commodity } from '../../../types/commodities';

// Mock the common components
jest.mock('../../../components/common', () => ({
  Button: ({ children, onClick, variant, className, type, ...props }: any) => (
    <button 
      onClick={onClick} 
      data-variant={variant} 
      className={className}
      type={type}
      {...props}
    >
      {children}
    </button>
  ),
  Modal: ({ isOpen, onClose, title, footer, children }: any) => (
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose} data-testid="modal-close">×</button>
        <div>{children}</div>
        <div data-testid="modal-footer">{footer}</div>
      </div>
    ) : null
  ),
  Table: ({ columns, data, emptyMessage }: any) => (
    <div data-testid="orders-table">
      {data.length === 0 ? (
        <div data-testid="empty-message">{emptyMessage}</div>
      ) : (
        <table>
          <thead>
            <tr>
              {columns.map((col: any) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, index: number) => (
              <tr key={index}>
                {columns.map((col: any) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}));

describe('OrdersFeature Component', () => {
  const mockOrders: Order[] = [
    {
      id: 1,
      customer: 'ABC Market',
      commodity: 'Romaine',
      volume: 1000,
      marketType: 'Fresh Cut',
      deliveryDate: '2024-05-15',
      isWeekly: false
    },
    {
      id: 2,
      customer: 'XYZ Store',
      commodity: 'Iceberg',
      volume: 2500,
      marketType: 'Bulk',
      deliveryDate: '2024-05-20',
      isWeekly: true
    }
  ];

  const mockCommodities: Commodity[] = [
    {
      id: 1,
      name: 'Romaine',
      varieties: []
    },
    {
      id: 2,
      name: 'Iceberg',
      varieties: []
    },
    {
      id: 3,
      name: 'Spinach',
      varieties: []
    }
  ];

  const mockProps: OrdersFeatureProps = {
    orders: mockOrders,
    onAddOrder: jest.fn(),
    onUpdateOrder: jest.fn(),
    onDeleteOrder: jest.fn(),
    commodities: mockCommodities
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the main title', () => {
      render(<OrdersFeature {...mockProps} />);
      
      expect(screen.getByText('Customer Orders')).toBeInTheDocument();
    });

    it('should render the Add Order button', () => {
      render(<OrdersFeature {...mockProps} />);
      
      expect(screen.getByText('Add Order')).toBeInTheDocument();
    });

    it('should render the orders table', () => {
      render(<OrdersFeature {...mockProps} />);
      
      expect(screen.getByTestId('orders-table')).toBeInTheDocument();
    });

    it('should not show modal initially', () => {
      render(<OrdersFeature {...mockProps} />);
      
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should apply correct styling classes', () => {
      const { container } = render(<OrdersFeature {...mockProps} />);
      
      const mainContainer = container.querySelector('.space-y-6');
      expect(mainContainer).toBeInTheDocument();
      
      const header = container.querySelector('.flex.justify-between.items-center');
      expect(header).toBeInTheDocument();
    });
  });

  describe('orders table', () => {
    it('should display orders data correctly', () => {
      render(<OrdersFeature {...mockProps} />);
      
      expect(screen.getByText('ABC Market')).toBeInTheDocument();
      expect(screen.getByText('XYZ Store')).toBeInTheDocument();
      expect(screen.getByText('Romaine')).toBeInTheDocument();
      expect(screen.getByText('Iceberg')).toBeInTheDocument();
      expect(screen.getByText('Fresh Cut')).toBeInTheDocument();
      expect(screen.getByText('Bulk')).toBeInTheDocument();
    });

    it('should format volume with locale string', () => {
      render(<OrdersFeature {...mockProps} />);
      
      expect(screen.getByText('1,000')).toBeInTheDocument();
      expect(screen.getByText('2,500')).toBeInTheDocument();
    });

    it('should display order type correctly', () => {
      render(<OrdersFeature {...mockProps} />);
      
      expect(screen.getByText('One-time')).toBeInTheDocument();
      expect(screen.getByText('Weekly')).toBeInTheDocument();
    });

    it('should display delivery dates', () => {
      render(<OrdersFeature {...mockProps} />);
      
      expect(screen.getByText('2024-05-15')).toBeInTheDocument();
      expect(screen.getByText('2024-05-20')).toBeInTheDocument();
    });

    it('should render action buttons for each order', () => {
      render(<OrdersFeature {...mockProps} />);
      
      const editButtons = screen.getAllByText('Edit');
      const deleteButtons = screen.getAllByText('Delete');
      
      expect(editButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);
    });

    it('should show empty message when no orders', () => {
      render(<OrdersFeature {...mockProps} orders={[]} />);
      
      expect(screen.getByTestId('empty-message')).toBeInTheDocument();
      expect(screen.getByText('No orders found. Add your first order to get started.')).toBeInTheDocument();
    });
  });

  describe('add order functionality', () => {
    it('should open modal when Add Order button is clicked', () => {
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Add New Order')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      expect(screen.getByPlaceholderText('Customer Name')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Select Commodity')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Fresh Cut')).toBeInTheDocument(); // Default market type
      expect(screen.getByPlaceholderText('Volume')).toBeInTheDocument();
      expect(document.querySelector('input[type="date"]')).toBeInTheDocument(); // Date field
      expect(screen.getByText('Weekly recurring order')).toBeInTheDocument();
    });

    it('should populate commodity dropdown with options', () => {
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      const commoditySelect = screen.getByDisplayValue('Select Commodity');
      expect(commoditySelect).toBeInTheDocument();
      
      // Check that commodity options are rendered (via option elements in select)
      const selectElement = commoditySelect as HTMLSelectElement;
      expect(selectElement.children).toHaveLength(4); // 1 default + 3 commodities
    });

    it('should populate market type dropdown with options', () => {
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      const marketTypeSelect = screen.getByDisplayValue('Fresh Cut');
      expect(marketTypeSelect).toBeInTheDocument();
      
      // Market types should be populated from MARKET_TYPES constant
      const selectElement = marketTypeSelect as HTMLSelectElement;
      expect(selectElement.children.length).toBeGreaterThan(1);
    });

    it('should render form footer buttons', () => {
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getAllByText('Add Order')).toHaveLength(2); // Header button + Submit button
    });
  });

  describe('form interaction', () => {
    it('should update form data when inputs change', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      const customerInput = screen.getByPlaceholderText('Customer Name');
      const volumeInput = screen.getByPlaceholderText('Volume');
      
      await user.type(customerInput, 'Test Customer');
      await user.type(volumeInput, '500');
      
      expect(customerInput).toHaveValue('Test Customer');
      expect(volumeInput).toHaveValue(500);
    });

    it('should handle commodity selection', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      const commoditySelect = screen.getByDisplayValue('Select Commodity');
      await user.selectOptions(commoditySelect, 'Romaine');
      
      expect(commoditySelect).toHaveValue('Romaine');
    });

    it('should handle market type selection', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      const marketTypeSelect = screen.getByDisplayValue('Fresh Cut');
      await user.selectOptions(marketTypeSelect, 'Bulk');
      
      expect(marketTypeSelect).toHaveValue('Bulk');
    });

    it('should handle date input', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      await user.type(dateInput, '2024-06-15');
      
      expect(dateInput).toHaveValue('2024-06-15');
    });

    it('should handle weekly checkbox toggle', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      const weeklyCheckbox = screen.getByRole('checkbox');
      expect(weeklyCheckbox).not.toBeChecked();
      
      await user.click(weeklyCheckbox);
      expect(weeklyCheckbox).toBeChecked();
    });
  });

  describe('form submission', () => {
    it('should call onAddOrder with correct data when form is valid', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      // Fill out the form
      await user.type(screen.getByPlaceholderText('Customer Name'), 'New Customer');
      await user.selectOptions(screen.getByDisplayValue('Select Commodity'), 'Spinach');
      await user.type(screen.getByPlaceholderText('Volume'), '750');
      await user.type(document.querySelector('input[type="date"]') as HTMLInputElement, '2024-06-01');
      await user.click(screen.getByRole('checkbox')); // Set weekly to true
      
      // Submit the form
      const modalFooter = screen.getByTestId('modal-footer');
      const submitBtn = modalFooter.querySelector('button[type="submit"]') as HTMLButtonElement;
      fireEvent.click(submitBtn);
      
      expect(mockProps.onAddOrder).toHaveBeenCalledWith({
        customer: 'New Customer',
        commodity: 'Spinach',
        volume: 750,
        marketType: 'Fresh Cut', // Default value
        deliveryDate: '2024-06-01',
        isWeekly: true
      });
    });

    it('should not submit when required fields are missing', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      // Only fill customer name, leave other required fields empty
      await user.type(screen.getByPlaceholderText('Customer Name'), 'Incomplete Customer');
      
            // Click submit button
      fireEvent.click(screen.getAllByText('Add Order')[1]);

      expect(mockProps.onAddOrder).not.toHaveBeenCalled();
    });

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      // Fill and submit form
      await user.type(screen.getByPlaceholderText('Customer Name'), 'Test Customer');
      await user.selectOptions(screen.getByDisplayValue('Select Commodity'), 'Romaine');
      await user.type(screen.getByPlaceholderText('Volume'), '1000');
      await user.type(document.querySelector('input[type="date"]') as HTMLInputElement, '2024-06-01');
      
            // Click submit button
      fireEvent.click(screen.getAllByText('Add Order')[1]);

      // Modal should be closed after submission
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should handle form submission via form onSubmit event', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      // Fill out the form
      await user.type(screen.getByPlaceholderText('Customer Name'), 'Form Submit Customer');
      await user.selectOptions(screen.getByDisplayValue('Select Commodity'), 'Iceberg');
      await user.type(screen.getByPlaceholderText('Volume'), '2000');
      await user.type(document.querySelector('input[type="date"]') as HTMLInputElement, '2024-07-01');
      
      // Submit via form submission (Enter key or form submit event)
      const form = screen.getByTestId('modal').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      expect(mockProps.onAddOrder).toHaveBeenCalledWith({
        customer: 'Form Submit Customer',
        commodity: 'Iceberg',
        volume: 2000,
        marketType: 'Fresh Cut',
        deliveryDate: '2024-07-01',
        isWeekly: false
      });
    });
  });

  describe('edit order functionality', () => {
    it('should open modal in edit mode when Edit button is clicked', () => {
      render(<OrdersFeature {...mockProps} />);
      
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Edit Order')).toBeInTheDocument();
      expect(screen.getByText('Update Order')).toBeInTheDocument(); // Submit button changes
    });

    it('should populate form with existing order data', () => {
      render(<OrdersFeature {...mockProps} />);
      
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]); // Edit first order (ABC Market)
      
      expect(screen.getByDisplayValue('ABC Market')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Romaine')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Fresh Cut')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024-05-15')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).not.toBeChecked(); // isWeekly is false
    });

    it('should populate form with weekly order data correctly', () => {
      render(<OrdersFeature {...mockProps} />);
      
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[1]); // Edit second order (XYZ Store, weekly)
      
      expect(screen.getByDisplayValue('XYZ Store')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Iceberg')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2500')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bulk')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024-05-20')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeChecked(); // isWeekly is true
    });

    it('should call onUpdateOrder when edit form is submitted', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      
      // Modify the customer name
      const customerInput = screen.getByDisplayValue('ABC Market');
      await user.clear(customerInput);
      await user.type(customerInput, 'Modified ABC Market');
      
      fireEvent.click(screen.getByText('Update Order'));
      
      expect(mockProps.onUpdateOrder).toHaveBeenCalledWith(1, {
        customer: 'Modified ABC Market',
        commodity: 'Romaine',
        volume: 1000,
        marketType: 'Fresh Cut',
        deliveryDate: '2024-05-15',
        isWeekly: false
      });
    });

    it('should not update when required fields are missing in edit mode', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      
      // Clear required field
      const customerInput = screen.getByDisplayValue('ABC Market');
      await user.clear(customerInput);
      
      fireEvent.click(screen.getByText('Update Order'));
      
      expect(mockProps.onUpdateOrder).not.toHaveBeenCalled();
    });
  });

  describe('delete order functionality', () => {
    it('should call onDeleteOrder when Delete button is clicked', () => {
      render(<OrdersFeature {...mockProps} />);
      
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      
      expect(mockProps.onDeleteOrder).toHaveBeenCalledWith(1);
    });

    it('should call onDeleteOrder with correct ID for different orders', () => {
      render(<OrdersFeature {...mockProps} />);
      
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[1]); // Delete second order
      
      expect(mockProps.onDeleteOrder).toHaveBeenCalledWith(2);
    });
  });

  describe('modal controls', () => {
    it('should close modal when Cancel button is clicked', () => {
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should close modal when modal close button is clicked', () => {
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      
      fireEvent.click(screen.getByTestId('modal-close'));
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should reset form data when modal is closed', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      // Open modal and fill some data
      fireEvent.click(screen.getByText('Add Order'));
      await user.type(screen.getByPlaceholderText('Customer Name'), 'Test Data');
      
      // Close modal
      fireEvent.click(screen.getByText('Cancel'));
      
      // Reopen modal - data should be reset
      fireEvent.click(screen.getByText('Add Order'));
      expect(screen.getByPlaceholderText('Customer Name')).toHaveValue('');
    });

    it('should reset edit state when modal is closed', () => {
      render(<OrdersFeature {...mockProps} />);
      
      // Start editing an order
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      expect(screen.getByText('Edit Order')).toBeInTheDocument();
      
      // Close modal
      fireEvent.click(screen.getByText('Cancel'));
      
      // Reopen modal - should be in add mode
      fireEvent.click(screen.getByText('Add Order'));
      expect(screen.getByText('Add New Order')).toBeInTheDocument();
      expect(screen.getAllByText('Add Order')).toHaveLength(2); // Header button + Submit button
    });
  });

  describe('form validation', () => {
    it('should require customer name', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      // Fill all fields except customer
      await user.selectOptions(screen.getByDisplayValue('Select Commodity'), 'Romaine');
      await user.type(screen.getByPlaceholderText('Volume'), '1000');
            await user.type(document.querySelector('input[type="date"]') as HTMLInputElement, '2024-06-01');

      // Click submit button
      fireEvent.click(screen.getAllByText('Add Order')[1]);

      expect(mockProps.onAddOrder).not.toHaveBeenCalled();
    });

    it('should require commodity selection', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      // Fill all fields except commodity
      await user.type(screen.getByPlaceholderText('Customer Name'), 'Test Customer');
      await user.type(screen.getByPlaceholderText('Volume'), '1000');
            await user.type(document.querySelector('input[type="date"]') as HTMLInputElement, '2024-06-01');

      // Click submit button
      fireEvent.click(screen.getAllByText('Add Order')[1]);

      expect(mockProps.onAddOrder).not.toHaveBeenCalled();
    });

    it('should require volume', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      // Fill all fields except volume
      await user.type(screen.getByPlaceholderText('Customer Name'), 'Test Customer');
      await user.selectOptions(screen.getByDisplayValue('Select Commodity'), 'Romaine');
            await user.type(document.querySelector('input[type="date"]') as HTMLInputElement, '2024-06-01');

      // Click submit button
      fireEvent.click(screen.getAllByText('Add Order')[1]);

      expect(mockProps.onAddOrder).not.toHaveBeenCalled();
    });

    it('should require delivery date', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      // Fill all fields except delivery date
      await user.type(screen.getByPlaceholderText('Customer Name'), 'Test Customer');
      await user.selectOptions(screen.getByDisplayValue('Select Commodity'), 'Romaine');
      await user.type(screen.getByPlaceholderText('Volume'), '1000');
      
            // Click submit button
      fireEvent.click(screen.getAllByText('Add Order')[1]);

      expect(mockProps.onAddOrder).not.toHaveBeenCalled();
    });

    it('should convert volume string to number', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      await user.type(screen.getByPlaceholderText('Customer Name'), 'Test Customer');
      await user.selectOptions(screen.getByDisplayValue('Select Commodity'), 'Romaine');
      await user.type(screen.getByPlaceholderText('Volume'), '1500.5');
            await user.type(document.querySelector('input[type="date"]') as HTMLInputElement, '2024-06-01');

      // Click submit button
      fireEvent.click(screen.getAllByText('Add Order')[1]);

      expect(mockProps.onAddOrder).toHaveBeenCalledWith({
        customer: 'Test Customer',
        commodity: 'Romaine',
        volume: 1500.5, // Should be converted to number
        marketType: 'Fresh Cut',
        deliveryDate: '2024-06-01',
        isWeekly: false
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty commodities array', () => {
      render(<OrdersFeature {...mockProps} commodities={[]} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      const commoditySelect = screen.getByDisplayValue('Select Commodity');
      expect(commoditySelect.children).toHaveLength(1); // Only default option
    });

        it('should handle very large order volumes', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      await user.type(screen.getByPlaceholderText('Customer Name'), 'Large Order Customer');
      await user.selectOptions(screen.getByDisplayValue('Select Commodity'), 'Romaine');
      await user.type(screen.getByPlaceholderText('Volume'), '999999999');
      await user.type(document.querySelector('input[type="date"]') as HTMLInputElement, '2024-06-01');

      // Click submit button
      fireEvent.click(screen.getAllByText('Add Order')[1]);
      
      expect(mockProps.onAddOrder).toHaveBeenCalledWith({
        customer: 'Large Order Customer',
        commodity: 'Romaine',
        volume: 999999999,
        marketType: 'Fresh Cut',
        deliveryDate: '2024-06-01',
        isWeekly: false
      });
    });

        it('should handle special characters in customer names', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      await user.type(screen.getByPlaceholderText('Customer Name'), 'O\'Reilly & Co. - Market #1');
      await user.selectOptions(screen.getByDisplayValue('Select Commodity'), 'Romaine');
      await user.type(screen.getByPlaceholderText('Volume'), '500');
      await user.type(document.querySelector('input[type="date"]') as HTMLInputElement, '2024-06-01');

      // Click submit button
      fireEvent.click(screen.getAllByText('Add Order')[1]);
      
      expect(mockProps.onAddOrder).toHaveBeenCalledWith({
        customer: 'O\'Reilly & Co. - Market #1',
        commodity: 'Romaine',
        volume: 500,
        marketType: 'Fresh Cut',
        deliveryDate: '2024-06-01',
        isWeekly: false
      });
    });

        it('should handle orders with zero volume', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      await user.type(screen.getByPlaceholderText('Customer Name'), 'Zero Volume Customer');
      await user.selectOptions(screen.getByDisplayValue('Select Commodity'), 'Romaine');
      await user.type(screen.getByPlaceholderText('Volume'), '0');
      await user.type(document.querySelector('input[type="date"]') as HTMLInputElement, '2024-06-01');

      // Click submit button
      fireEvent.click(screen.getAllByText('Add Order')[1]);
      
      // Zero volume is actually submitted - component allows 0 as valid volume
      expect(mockProps.onAddOrder).toHaveBeenCalledWith({
        customer: 'Zero Volume Customer',
        commodity: 'Romaine',
        volume: 0,
        marketType: 'Fresh Cut',
        deliveryDate: '2024-06-01',
        isWeekly: false
      });
    });

    it('should handle rapid form submissions', async () => {
      const user = userEvent.setup();
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order'));
      
      // Fill out valid form
      await user.type(screen.getByPlaceholderText('Customer Name'), 'Rapid Customer');
      await user.selectOptions(screen.getByDisplayValue('Select Commodity'), 'Romaine');
      await user.type(screen.getByPlaceholderText('Volume'), '1000');
      await user.type(document.querySelector('input[type="date"]') as HTMLInputElement, '2024-06-01');
      
      // Rapid clicks on submit button
      const submitButton = screen.getAllByText('Add Order')[1]; // Submit button in modal
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      
      // Should only be called once since modal closes after first submission
      expect(mockProps.onAddOrder).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have proper form labels', () => {
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order')); // Open the modal
      
      // Check that form labels exist in the modal (not table headers)
      const modalForm = screen.getByTestId('modal');
      expect(modalForm.querySelector('label')).toBeInTheDocument();
      expect(screen.getByText('Customer Name')).toBeInTheDocument();
      expect(screen.getAllByText('Commodity').length).toBeGreaterThan(0); // Appears in both table and form
      expect(screen.getAllByText('Market Type').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Volume').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Delivery Date').length).toBeGreaterThan(0);
      expect(screen.getByText('Weekly recurring order')).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(<OrdersFeature {...mockProps} />);
      
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('Customer Orders');
    });

    it('should support keyboard navigation', () => {
      render(<OrdersFeature {...mockProps} />);
      
      const addButton = screen.getByText('Add Order');
      addButton.focus();
      expect(addButton).toHaveFocus();
    });

    it('should have proper input types', () => {
      render(<OrdersFeature {...mockProps} />);
      
      fireEvent.click(screen.getByText('Add Order')); // Open the modal
      
      expect(screen.getByPlaceholderText('Customer Name')).toHaveAttribute('type', 'text');
      expect(screen.getByPlaceholderText('Volume')).toHaveAttribute('type', 'number');
      expect(document.querySelector('input[type="date"]')).toHaveAttribute('type', 'date');
      expect(screen.getByRole('checkbox')).toHaveAttribute('type', 'checkbox');
    });
  });

  describe('table integration', () => {
    it('should pass correct columns configuration to table', () => {
      render(<OrdersFeature {...mockProps} />);
      
      // Verify table headers are rendered correctly
      expect(screen.getByText('Customer')).toBeInTheDocument();
      expect(screen.getByText('Commodity')).toBeInTheDocument();
      expect(screen.getByText('Market Type')).toBeInTheDocument();
      expect(screen.getByText('Volume')).toBeInTheDocument();
      expect(screen.getByText('Delivery Date')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should render action buttons with correct styling', () => {
      render(<OrdersFeature {...mockProps} />);
      
      const editButtons = screen.getAllByText('Edit');
      const deleteButtons = screen.getAllByText('Delete');
      
      editButtons.forEach(button => {
        expect(button).toHaveAttribute('data-variant', 'secondary');
        expect(button).toHaveClass('text-xs px-2 py-1');
      });
      
      deleteButtons.forEach(button => {
        expect(button).toHaveAttribute('data-variant', 'danger');
        expect(button).toHaveClass('text-xs px-2 py-1');
      });
    });
  });
});
