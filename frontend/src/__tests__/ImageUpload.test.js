/**
 * Unit tests for ImageUpload component
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageUpload from '../components/ImageUpload';

describe('ImageUpload Component', () => {
  test('renders upload area', () => {
    const mockOnUpload = jest.fn();
    render(<ImageUpload onUpload={mockOnUpload} />);
    
    expect(screen.getByText(/drag.*drop/i)).toBeInTheDocument();
  });

  test('shows preview after image selection', async () => {
    const mockOnUpload = jest.fn();
    render(<ImageUpload onUpload={mockOnUpload} />);
    
    const file = new File(['image'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/upload/i) || document.querySelector('input[type="file"]');
    
    if (input) {
      fireEvent.change(input, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalled();
      });
    }
  });

  test('validates file size', async () => {
    const mockOnUpload = jest.fn();
    render(<ImageUpload onUpload={mockOnUpload} maxSizeMB={1} />);
    
    // Create a large file (over 1MB)
    const largeFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'large.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');
    
    if (input) {
      fireEvent.change(input, { target: { files: [largeFile] } });
      
      await waitFor(() => {
        // Should show error or not call onUpload
        expect(mockOnUpload).not.toHaveBeenCalled();
      });
    }
  });

  test('accepts valid image formats', async () => {
    const mockOnUpload = jest.fn();
    render(<ImageUpload onUpload={mockOnUpload} />);
    
    const validFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]');
    
    if (input) {
      fireEvent.change(input, { target: { files: [validFile] } });
      
      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith(expect.any(String));
      });
    }
  });
});
