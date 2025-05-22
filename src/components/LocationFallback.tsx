import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { LocationInput } from './LocationInput';
import { cn } from '../lib/utils';

interface LocationFallbackProps {
  onSubmit: (city: string) => void;
  isLoading?: boolean;
}

export function LocationFallback({ onSubmit, isLoading }: LocationFallbackProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 mb-4">
        <MapPin className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            Enter Your City
          </h3>
          <p className="text-sm text-gray-600">
            Please enter your city name for personalized recommendations.
          </p>
        </div>
      </div>

      <LocationInput onLocationSubmit={onSubmit} />
    </div>
  );
}