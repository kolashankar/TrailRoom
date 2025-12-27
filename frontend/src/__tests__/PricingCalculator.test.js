/**
 * Unit tests for PricingCalculator component
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PricingCalculator from '../components/PricingCalculator';

describe('PricingCalculator Component', () => {
  test('renders slider with default value', () => {
    render(<PricingCalculator />);
    
    // Should have a slider input
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
  });

  test('displays credit amount', () => {
    render(<PricingCalculator defaultCredits={5000} />);
    
    expect(screen.getByText(/5000|5,000/)).toBeInTheDocument();
  });

  test('calculates price correctly', async () => {
    render(<PricingCalculator defaultCredits={2100} />);
    
    // At 2100 credits with 10% discount
    // If base price is 1 per credit: 2100 * 0.9 = 1890
    await waitFor(() => {
      expect(screen.getByText(/1890|₹1,890/)).toBeInTheDocument();
    });
  });

  test('shows discount percentage', async () => {
    render(<PricingCalculator defaultCredits={2100} />);
    
    await waitFor(() => {
      expect(screen.getByText(/10%.*discount/i)).toBeInTheDocument();
    });
  });

  test('updates price when slider moves', async () => {
    render(<PricingCalculator />);
    
    const slider = screen.getByRole('slider');
    
    // Change slider value
    fireEvent.change(slider, { target: { value: '10000' } });
    
    await waitFor(() => {
      expect(screen.getByText(/10000|10,000/)).toBeInTheDocument();
    });
  });

  test('shows maximum discount at high credits', async () => {
    render(<PricingCalculator defaultCredits={50000} />);
    
    await waitFor(() => {
      expect(screen.getByText(/25%.*discount/i)).toBeInTheDocument();
    });
  });

  test('shows no discount for low credits', () => {
    render(<PricingCalculator defaultCredits={1000} />);
    
    expect(screen.queryByText(/discount/i)).not.toBeInTheDocument();
  });
});
