/**
 * Unit tests for ModeSelector component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModeSelector from '../components/ModeSelector';

describe('ModeSelector Component', () => {
  test('renders both mode options', () => {
    const mockOnSelect = jest.fn();
    render(<ModeSelector onSelect={mockOnSelect} />);
    
    expect(screen.getByText(/top.*only/i)).toBeInTheDocument();
    expect(screen.getByText(/full.*outfit/i)).toBeInTheDocument();
  });

  test('displays credit cost for each mode', () => {
    const mockOnSelect = jest.fn();
    render(<ModeSelector onSelect={mockOnSelect} />);
    
    // Should show 1 credit for top only
    expect(screen.getByText(/1.*credit/i)).toBeInTheDocument();
    // Should show 2 credits for full outfit
    expect(screen.getByText(/2.*credits/i)).toBeInTheDocument();
  });

  test('calls onSelect when mode is selected', () => {
    const mockOnSelect = jest.fn();
    render(<ModeSelector onSelect={mockOnSelect} selectedMode="" />);
    
    const topOnlyButton = screen.getByRole('button', { name: /top.*only/i });
    fireEvent.click(topOnlyButton);
    
    expect(mockOnSelect).toHaveBeenCalledWith('top_only');
  });

  test('highlights selected mode', () => {
    const mockOnSelect = jest.fn();
    render(<ModeSelector onSelect={mockOnSelect} selectedMode="top_only" />);
    
    const topOnlyButton = screen.getByRole('button', { name: /top.*only/i });
    
    // Selected mode should have different styling
    expect(topOnlyButton).toHaveClass(/selected|active|bg-/i);
  });

  test('allows switching between modes', () => {
    const mockOnSelect = jest.fn();
    const { rerender } = render(<ModeSelector onSelect={mockOnSelect} selectedMode="top_only" />);
    
    const fullOutfitButton = screen.getByRole('button', { name: /full.*outfit/i });
    fireEvent.click(fullOutfitButton);
    
    expect(mockOnSelect).toHaveBeenCalledWith('full_outfit');
    
    rerender(<ModeSelector onSelect={mockOnSelect} selectedMode="full_outfit" />);
    expect(fullOutfitButton).toHaveClass(/selected|active|bg-/i);
  });
});
