import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

interface LocationInputProps {
  onLocationSubmit: (address: string) => void;
}

interface Suggestion {
  description: string;
  place_id: string;
}

export function LocationInput({ onLocationSubmit }: LocationInputProps) {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<number>();

  const fetchSuggestions = async (input: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://api.locationiq.com/v1/autocomplete?key=pk.0f4b14cae2d3c9c3c2d71df0bb651e4e&q=${encodeURIComponent(input)}&limit=5&tag=place:city`
      );
      
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      
      const data = await response.json();
      
      // Format suggestions to show only city, state, country
      const formattedSuggestions = data.map((item: any) => ({
        description: [
          item.address.name,
          item.address.state,
          item.address.country
        ].filter(Boolean).join(', '),
        place_id: item.place_id
      }));
      
      setSuggestions(formattedSuggestions);
    } catch (err) {
      setError('Failed to load suggestions');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address.length >= 3) {
      // Clear existing timeout
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout to debounce API calls
      timeoutRef.current = window.setTimeout(() => {
        fetchSuggestions(address);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [address]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onLocationSubmit(address);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setAddress(suggestion.description);
    setSuggestions([]);
    onLocationSubmit(suggestion.description);
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your city"
            className={cn(
              'w-full pl-10 pr-4 py-3 rounded-xl',
              'text-[17px] placeholder:text-gray-400',
              'border border-gray-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'transition-all duration-200'
            )}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
            </div>
          )}
        </div>
      </form>

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors',
                'border-b border-gray-100 last:border-none'
              )}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">{suggestion.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}