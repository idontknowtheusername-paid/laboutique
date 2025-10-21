'use client';

import React from 'react';
import { Search, Clock, TrendingUp, Tag, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SearchSuggestion {
  type: 'product' | 'category' | 'brand' | 'trending';
  text: string;
  category?: string;
  brand?: string;
  slug?: string;
}

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  trending: string[];
  onSuggestionClick: (suggestion: string) => void;
  onTrendingClick: (trending: string) => void;
  isLoading?: boolean;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  trending,
  onSuggestionClick,
  onTrendingClick,
  isLoading = false
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Search className="w-4 h-4 text-orange-500" />;
      case 'category':
        return <Tag className="w-4 h-4 text-green-500" />;
      case 'brand':
        return <Star className="w-4 h-4 text-purple-500" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'product':
        return 'bg-orange-100 text-orange-800';
      case 'category':
        return 'bg-green-100 text-green-800';
      case 'brand':
        return 'bg-purple-100 text-purple-800';
      case 'trending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="absolute z-50 left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 max-h-80 overflow-y-auto">
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-jomionstore-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Recherche de suggestions...</p>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0 && trending.length === 0) {
    return null;
  }

  return (
    <div className="absolute z-50 left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 max-h-80 overflow-y-auto">
      {/* Suggestions principales */}
      {suggestions.length > 0 && (
        <div className="p-2">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
            Suggestions
          </div>
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${index}`}
              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer rounded-md group"
              onClick={() => onSuggestionClick(suggestion.text)}
            >
              <div className="flex items-center flex-1 min-w-0">
                {getIcon(suggestion.type)}
                <span className="ml-3 text-sm text-gray-900 truncate">
                  {suggestion.text}
                </span>
                <Badge 
                  variant="secondary" 
                  className={`ml-2 text-xs ${getBadgeColor(suggestion.type)}`}
                >
                  {suggestion.type}
                </Badge>
              </div>
              {suggestion.category && (
                <span className="text-xs text-gray-500 truncate ml-2">
                  dans {suggestion.category}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Trending searches */}
      {trending.length > 0 && (
        <div className="border-t p-2">
          <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <TrendingUp className="w-3 h-3 mr-1" />
            Tendances
          </div>
          <div className="flex flex-wrap gap-2 px-3 py-2">
            {trending.map((trend, index) => (
              <button
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 hover:bg-jomionstore-primary hover:text-white transition-colors"
                onClick={() => onTrendingClick(trend)}
              >
                <Clock className="w-3 h-3 mr-1" />
                {trend}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer avec raccourcis */}
      <div className="border-t bg-gray-50 px-3 py-2 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>Appuyez sur Entrée pour rechercher</span>
          <span>↑↓ pour naviguer</span>
        </div>
      </div>
    </div>
  );
};

export default SearchSuggestions;