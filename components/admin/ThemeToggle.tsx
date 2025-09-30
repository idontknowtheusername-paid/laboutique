'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette 
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case 'light': return <Sun className="w-4 h-4" />;
      case 'dark': return <Moon className="w-4 h-4" />;
      case 'system': return <Monitor className="w-4 h-4" />;
      default: return <Palette className="w-4 h-4" />;
    }
  };

  const getThemeLabel = (themeValue: string) => {
    switch (themeValue) {
      case 'light': return 'Clair';
      case 'dark': return 'Sombre';
      case 'system': return 'Système';
      default: return 'Thème';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Thème:
      </span>
      <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
        <SelectTrigger className="w-32">
          <div className="flex items-center gap-2">
            {getThemeIcon(theme)}
            <SelectValue>
              {getThemeLabel(theme)}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Clair
            </div>
          </SelectItem>
          <SelectItem value="dark">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              Sombre
            </div>
          </SelectItem>
          <SelectItem value="system">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Système
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function QuickThemeToggle() {
  const { actualTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(actualTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      aria-label={`Basculer vers le thème ${actualTheme === 'light' ? 'sombre' : 'clair'}`}
      className="relative"
    >
      {actualTheme === 'light' ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
      <span className="sr-only">
        {actualTheme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
      </span>
    </Button>
  );
}