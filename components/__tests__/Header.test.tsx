import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../layout/Header';

// Mock the cart context
jest.mock('@/contexts/CartContext', () => ({
  useCart: () => ({
    getCartItemsCount: () => 3,
  }),
}));

// Mock the auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    signOut: jest.fn(),
  }),
}));

describe('Header Component', () => {
  test('renders header with logo', () => {
    render(<Header />);
    
    expect(screen.getByText('JomiaStore Hub')).toBeInTheDocument();
    expect(screen.getByText('Centre commercial digital')).toBeInTheDocument();
  });

  test('renders search bar', () => {
    render(<Header />);
    
    const searchInput = screen.getByPlaceholderText(/Rechercher/);
    expect(searchInput).toBeInTheDocument();
  });

  test('renders navigation buttons', () => {
    render(<Header />);
    
    // Check for cart button
    const cartButton = screen.getByRole('button', { name: /cart/i });
    expect(cartButton).toBeInTheDocument();
  });

  test('displays cart count', () => {
    render(<Header />);
    
    // Should show cart count badge
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('handles search input', () => {
    render(<Header />);
    
    const searchInput = screen.getByPlaceholderText(/Rechercher/);
    fireEvent.change(searchInput, { target: { value: 'smartphone' } });
    
    expect(searchInput).toHaveValue('smartphone');
  });
});