import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Breadcrumb } from '../ui/breadcrumb';
import { Home, ChevronRight } from 'lucide-react';

describe('Breadcrumb Component', () => {
  const mockItems = [
    { label: 'Accueil', href: '/', icon: Home },
    { label: 'Catégorie', href: '/category' },
    { label: 'Produit', href: '/product' },
  ];

  test('renders breadcrumb items', () => {
    render(<Breadcrumb items={mockItems} />);
    
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Catégorie')).toBeInTheDocument();
    expect(screen.getByText('Produit')).toBeInTheDocument();
  });

  test('renders links correctly', () => {
    render(<Breadcrumb items={mockItems} />);
    
    const homeLink = screen.getByRole('link', { name: /Accueil/ });
    expect(homeLink).toHaveAttribute('href', '/');
    
    const categoryLink = screen.getByRole('link', { name: /Catégorie/ });
    expect(categoryLink).toHaveAttribute('href', '/category');
  });

  test('renders with single item', () => {
    const singleItem = [{ label: 'Accueil', href: '/', icon: Home }];
    render(<Breadcrumb items={singleItem} />);
    
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.queryByText('Catégorie')).not.toBeInTheDocument();
  });

  test('renders without icon', () => {
    const itemsWithoutIcon = [
      { label: 'Accueil', href: '/' },
      { label: 'Catégorie', href: '/category' },
    ];
    render(<Breadcrumb items={itemsWithoutIcon} />);
    
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Catégorie')).toBeInTheDocument();
  });
});