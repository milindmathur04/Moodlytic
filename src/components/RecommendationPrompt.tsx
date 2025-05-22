import React, { useState } from 'react';
import { MessageSquare, Utensils, Activity, Film } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

interface RecommendationPromptProps {
  onSubmit: (prompts: {
    food?: string;
    activity?: string;
    entertainment?: string;
  }) => void;
  isLoading?: boolean;
}

export function RecommendationPrompt({ onSubmit, isLoading }: RecommendationPromptProps) {
  const [prompts, setPrompts] = useState({
    food: '',
    activity: '',
    entertainment: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filledPrompts = Object.entries(prompts).reduce((acc, [key, value]) => {
      if (value.trim()) {
        acc[key as keyof typeof prompts] = value.trim();
      }
      return acc;
    }, {} as Partial<typeof prompts>);

    if (Object.keys(filledPrompts).length > 0) {
      onSubmit(filledPrompts);
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 " +
    "focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 " +
    "placeholder:text-gray-400 text-gray-900";

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Customize Your Recommendations
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Tell us more about your preferences
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Utensils className="w-4 h-4 text-orange-500" />
              <label className="text-sm font-medium text-gray-700">
                Food Preferences
              </label>
            </div>
            <input
              type="text"
              value={prompts.food}
              onChange={(e) => setPrompts(prev => ({ ...prev, food: e.target.value }))}
              placeholder="e.g., vegetarian, spicy food, Italian cuisine"
              className={cn(inputClasses, "focus:ring-orange-500")}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-500" />
              <label className="text-sm font-medium text-gray-700">
                Activity Preferences
              </label>
            </div>
            <input
              type="text"
              value={prompts.activity}
              onChange={(e) => setPrompts(prev => ({ ...prev, activity: e.target.value }))}
              placeholder="e.g., outdoor activities, sports, relaxing"
              className={cn(inputClasses, "focus:ring-green-500")}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Film className="w-4 h-4 text-purple-500" />
              <label className="text-sm font-medium text-gray-700">
                Entertainment Preferences
              </label>
            </div>
            <input
              type="text"
              value={prompts.entertainment}
              onChange={(e) => setPrompts(prev => ({ ...prev, entertainment: e.target.value }))}
              placeholder="e.g., movies, live music, theater"
              className={cn(inputClasses, "focus:ring-purple-500")}
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || (!prompts.food && !prompts.activity && !prompts.entertainment)}
            className={cn(
              "w-full h-12 rounded-xl font-medium transition-all duration-200",
              "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
              "text-white shadow-lg",
              "hover:shadow-xl hover:scale-[1.02]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
              "relative overflow-hidden"
            )}
          >
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              "Update Recommendations"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}