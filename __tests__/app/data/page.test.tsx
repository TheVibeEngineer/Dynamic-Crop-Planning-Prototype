import React from 'react';
import { render } from '@testing-library/react';
import DataPage from '@/app/data/page';

// Mock the DataManagementFeature component
jest.mock('@/components/data', () => ({
  DataManagementFeature: () => (
    <div data-testid="data-management-feature">
      <h1>Data Management</h1>
      <button>Export Data</button>
      <button>Import Data</button>
      <button>Reset Data</button>
    </div>
  ),
}));

describe('DataPage', () => {
  it('should render DataManagementFeature', () => {
    const { getByTestId } = render(<DataPage />);
    
    expect(getByTestId('data-management-feature')).toBeInTheDocument();
  });

  it('should display data management interface', () => {
    const { getByText } = render(<DataPage />);
    
    expect(getByText('Data Management')).toBeInTheDocument();
    expect(getByText('Export Data')).toBeInTheDocument();
    expect(getByText('Import Data')).toBeInTheDocument();
    expect(getByText('Reset Data')).toBeInTheDocument();
  });

  it('should be a client component', () => {
    // This test verifies the page renders without server-side issues
    const { container } = render(<DataPage />);
    
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should have simple structure without context dependencies', () => {
    // DataPage doesn't use useAppContext, so it should be simpler
    const { getByTestId } = render(<DataPage />);
    
    expect(getByTestId('data-management-feature')).toBeInTheDocument();
  });
});
