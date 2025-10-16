'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Hook pour la gestion du focus
export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);
  const focusHistory = useRef<HTMLElement[]>([]);

  const setFocus = (element: HTMLElement | null) => {
    if (element) {
      focusHistory.current.push(element);
      setFocusedElement(element);
      element.focus();
    }
  };

  const restoreFocus = () => {
    const previousElement = focusHistory.current.pop();
    if (previousElement) {
      setFocusedElement(previousElement);
      previousElement.focus();
    }
  };

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  };

  return {
    focusedElement,
    setFocus,
    restoreFocus,
    trapFocus
  };
}

// Composant pour annoncer les changements aux screen readers
export function ScreenReaderAnnouncer() {
  const [announcement, setAnnouncement] = useState('');
  const [key, setKey] = useState(0);

  const announce = (message: string) => {
    setAnnouncement(message);
    setKey(prev => prev + 1);
  };

  // Exposer la fonction d'annonce globalement
  useEffect(() => {
    (window as any).announceToScreenReader = announce;
    return () => {
      delete (window as any).announceToScreenReader;
    };
  }, []);

  return (
    <div
      key={key}
      className="sr-only"
      aria-live="polite"
      aria-atomic="true"
    >
      {announcement}
    </div>
  );
}

// Hook pour la navigation au clavier
export function useKeyboardNavigation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState<HTMLElement[]>([]);

  const registerItems = (newItems: HTMLElement[]) => {
    setItems(newItems);
  };

  const navigate = (direction: 'up' | 'down' | 'left' | 'right') => {
    const newIndex = direction === 'up' || direction === 'left' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(items.length - 1, currentIndex + 1);
    
    setCurrentIndex(newIndex);
    items[newIndex]?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        navigate('up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        navigate('down');
        break;
      case 'ArrowLeft':
        e.preventDefault();
        navigate('left');
        break;
      case 'ArrowRight':
        e.preventDefault();
        navigate('right');
        break;
      case 'Home':
        e.preventDefault();
        setCurrentIndex(0);
        items[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        setCurrentIndex(items.length - 1);
        items[items.length - 1]?.focus();
        break;
    }
  };

  return {
    currentIndex,
    registerItems,
    handleKeyDown,
    navigate
  };
}

// Composant pour les raccourcis clavier
export function KeyboardShortcuts({ 
  shortcuts, 
  children 
}: { 
  shortcuts: Record<string, () => void>;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const modifier = e.ctrlKey || e.metaKey;
      
      if (modifier && shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return <>{children}</>;
}

// Composant pour les tooltips accessibles
export function AccessibleTooltip({ 
  content, 
  children, 
  placement = 'top' 
}: { 
  content: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let x = 0;
      let y = 0;

      switch (placement) {
        case 'top':
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          y = triggerRect.top - tooltipRect.height - 8;
          break;
        case 'bottom':
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          y = triggerRect.bottom + 8;
          break;
        case 'left':
          x = triggerRect.left - tooltipRect.width - 8;
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          break;
        case 'right':
          x = triggerRect.right + 8;
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          break;
      }

      setPosition({ x, y });
    }
  }, [placement]);

  useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible, placement, updatePosition]);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      className="relative inline-block"
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg",
            "animate-in fade-in-0 zoom-in-95 duration-200"
          )}
          style={{
            left: position.x,
            top: position.y
          }}
          role="tooltip"
          aria-hidden="false"
        >
          {content}
        </div>
      )}
    </div>
  );
}

// Hook pour la détection des préférences d'accessibilité
export function useAccessibilityPreferences() {
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    largeText: false
  });

  useEffect(() => {
    // Détecter les préférences système
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      largeText: window.matchMedia('(prefers-reduced-motion: no-preference)')
    };

    const updatePreferences = () => {
      setPreferences({
        reducedMotion: mediaQueries.reducedMotion.matches,
        highContrast: mediaQueries.highContrast.matches,
        largeText: mediaQueries.largeText.matches
      });
    };

    updatePreferences();

    // Écouter les changements
    Object.values(mediaQueries).forEach(mq => {
      mq.addEventListener('change', updatePreferences);
    });

    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeEventListener('change', updatePreferences);
      });
    };
  }, []);

  return preferences;
}

// Composant pour les indicateurs de statut
export function StatusIndicator({ 
  status, 
  label 
}: { 
  status: 'success' | 'error' | 'warning' | 'info';
  label: string;
}) {
  const getStatusIcon = () => {
    switch (status) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-orange-600 bg-blue-100';
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
        getStatusColor()
      )}
      role="status"
      aria-label={`Statut: ${label}`}
    >
      <span aria-hidden="true">{getStatusIcon()}</span>
      <span>{label}</span>
    </div>
  );
}

// Hook pour la gestion des modales accessibles
export function useAccessibleModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const openModal = (modalTitle: string, modalDescription?: string) => {
    setTitle(modalTitle);
    setDescription(modalDescription || '');
    setIsOpen(true);
    previousFocusRef.current = document.activeElement as HTMLElement;
  };

  const closeModal = () => {
    setIsOpen(false);
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  };

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstFocusable = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  return {
    isOpen,
    title,
    description,
    modalRef,
    openModal,
    closeModal
  };
}