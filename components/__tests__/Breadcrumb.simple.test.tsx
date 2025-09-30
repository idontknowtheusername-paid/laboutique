import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Breadcrumb } from '../ui/breadcrumb';
import { Home } from 'lucide-react';

describe('Breadcrumb Component', () => {
  const mockItems = [
    { label: 'Accueil', href: '/', icon: Home },
    { label: 'Catégorie', href: '/category' },
  ];

  test('renders breadcrumb items', () => {
    render(<Breadcrumb items={mockItems} />);
    
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Catégorie')).toBeInTheDocument();
  });

  test('renders with single item', () => {
    const singleItem = [{ label: 'Accueil', href: '/', icon: Home }];
    render(<Breadcrumb items={singleItem} />);
    
    expect(screen.getByText('Accueil')).toBeInTheDocument();
  });
});