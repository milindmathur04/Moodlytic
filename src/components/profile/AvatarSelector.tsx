import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

// Updated avatar styles with correct API names and hyphens
const AVATAR_STYLES = [
  'pixel-art', // Fixed: Added hyphen for correct API endpoint
  'avataaars',
  'bottts',
  'lorelei',
  'micah',
  'adventurer'
];

const AVATAR_SEEDS = [
  'Felix', 'Lily', 'Max', 'Luna', 'Charlie', 'Lucy',
  'Oliver', 'Sophie', 'Leo', 'Mia', 'Oscar', 'Emma',
  'Jack', 'Chloe', 'Sam', 'Zoe', 'Alex', 'Nova'
];

// Updated URL generation with correct parameters
const generateAvatarUrl = (style: string, seed: string) => {
  const baseUrl = `https://api.dicebear.com/7.x/${style}/svg`;
  const params = new URLSearchParams({
    seed,
    backgroundColor: 'ffffff',
    radius: '50'
  });

  // Add style-specific parameters
  if (style === 'pixel-art') {
    params.append('scale', '70');
  }

  return `${baseUrl}?${params.toString()}`;
};

interface AvatarSelectorProps {
  selectedAvatar: string | null;
  onSelect: (url: string) => void;
  onFileUpload: (file: File) => void;
}

export function AvatarSelector({ selectedAvatar, onSelect, onFileUpload }: AvatarSelectorProps) {
  const [currentStyle, setCurrentStyle] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 6;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const nextStyle = () => {
    setCurrentStyle((prev) => (prev + 1) % AVATAR_STYLES.length);
    setStartIndex(0);
  };

  const prevStyle = () => {
    setCurrentStyle((prev) => (prev - 1 + AVATAR_STYLES.length) % AVATAR_STYLES.length);
    setStartIndex(0);
  };

  const nextAvatars = () => {
    setStartIndex((prev) => Math.min(prev + visibleCount, AVATAR_SEEDS.length - visibleCount));
  };

  const prevAvatars = () => {
    setStartIndex((prev) => Math.max(prev - visibleCount, 0));
  };

  const currentAvatars = AVATAR_SEEDS.slice(startIndex, startIndex + visibleCount).map(seed =>
    generateAvatarUrl(AVATAR_STYLES[currentStyle], seed)
  );

  const canScrollLeft = startIndex > 0;
  const canScrollRight = startIndex + visibleCount < AVATAR_SEEDS.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Choose an avatar
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={prevStyle}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Previous style"
            type="button"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm text-gray-600 capitalize">
            {AVATAR_STYLES[currentStyle].replace('-', ' ')} Style
          </span>
          <button
            onClick={nextStyle}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Next style"
            type="button"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center">
          <button
            onClick={prevAvatars}
            disabled={!canScrollLeft}
            type="button"
            className={cn(
              "p-2 rounded-full transition-all",
              canScrollLeft
                ? "text-gray-600 hover:bg-gray-100"
                : "text-gray-300 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex-1 grid grid-cols-3 gap-4 p-2">
            {currentAvatars.map((avatar) => (
              <button
                key={avatar}
                onClick={() => onSelect(avatar)}
                type="button"
                className={cn(
                  'p-2 rounded-xl transition-all duration-200',
                  selectedAvatar === avatar 
                    ? 'ring-2 ring-blue-500 scale-105 bg-blue-50'
                    : 'hover:scale-105 hover:bg-gray-50'
                )}
              >
                <img
                  src={avatar}
                  alt="Avatar option"
                  className="w-20 h-20 rounded-full bg-white"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          <button
            onClick={nextAvatars}
            disabled={!canScrollRight}
            type="button"
            className={cn(
              "p-2 rounded-full transition-all",
              canScrollRight
                ? "text-gray-600 hover:bg-gray-100"
                : "text-gray-300 cursor-not-allowed"
            )}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="relative">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x800px)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      </div>
    </div>
  );
}