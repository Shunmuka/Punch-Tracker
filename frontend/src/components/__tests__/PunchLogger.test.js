import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PunchLogger from '../PunchLogger';

// Mock axios
jest.mock('axios');
const axios = require('axios');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
global.localStorage = localStorageMock;

describe('PunchLogger Component', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('testuser');
    axios.post.mockResolvedValue({ data: { id: 1 } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders punch logging form', () => {
    render(<PunchLogger />);
    
    expect(screen.getByText('Log Punch Session')).toBeInTheDocument();
    expect(screen.getByText('Current Session:')).toBeInTheDocument();
    expect(screen.getByLabelText('Speed (mph):')).toBeInTheDocument();
    expect(screen.getByLabelText('Count:')).toBeInTheDocument();
  });

  test('allows selecting punch type', () => {
    render(<PunchLogger />);
    
    const jabButton = screen.getByText('Jab');
    fireEvent.click(jabButton);
    
    expect(jabButton).toHaveClass('selected');
  });

  test('submits punch data', async () => {
    render(<PunchLogger />);
    
    // Select punch type
    fireEvent.click(screen.getByText('Jab'));
    
    // Fill in speed
    fireEvent.change(screen.getByLabelText('Speed (mph):'), {
      target: { value: '25.5' }
    });
    
    // Fill in count
    fireEvent.change(screen.getByLabelText('Count:'), {
      target: { value: '2' }
    });
    
    // Submit form
    fireEvent.click(screen.getByText('Log Punch'));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/punches',
        expect.objectContaining({
          session_id: 1,
          punch_type: 'jab',
          speed: 25.5,
          count: 2
        })
      );
    });
  });

  test('shows error when not logged in', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<PunchLogger />);
    
    expect(screen.getByText('Please login first to log punches.')).toBeInTheDocument();
  });
});
