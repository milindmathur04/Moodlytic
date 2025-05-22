import React, { useState, useRef, useEffect } from 'react';
import { MoodSelector } from './MoodSelector';
import { MoodRecommendation } from './mood/MoodRecommendation';
import { MoodHeader } from './mood/MoodHeader';
import { EventList } from './events/EventList';
import { Background } from './ui/Background';
import { BudgetSlider } from './BudgetSlider';
import { RecommendationPrompt } from './RecommendationPrompt';
import { LocationFallback } from './LocationFallback';
import { useUserStore } from '../store/userStore';
import { useRecommendations } from '../hooks/useRecommendations';
import { useEvents } from '../hooks/useEvents';
import { useLocation } from '../hooks/useLocation';
import { APP_NAME } from '../constants/app';
import { Button } from './ui/Button';
import { MapPin } from 'lucide-react';
import type { Mood } from '../types';

export function MoodPage() {
  const { user } = useUserStore();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [budget, setBudget] = useState(50);
  const [customPrompts, setCustomPrompts] = useState<{
    food?: string;
    activity?: string;
    entertainment?: string;
  }>({});
  const previousMoodRef = useRef<Mood | null>(null);
  const { recommendation, error, isLoading, fetchRecommendation } = useRecommendations();
  const { events, isLoading: eventsLoading, error: eventsError } = useEvents(selectedMood, user, budget);
  const { 
    needsLocation, 
    isLoading: locationLoading, 
    error: locationError, 
    useDefaultLocation,
    handleLocationSubmit,
    handleManualLocation 
  } = useLocation();
  const recommendationRef = useRef<HTMLDivElement>(null);
  const customizeRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false);

  useEffect(() => {
    if (!user?.location) {
      handleLocationSubmit();
    }
  }, [user?.location, handleLocationSubmit]);

  useEffect(() => {
    if (selectedMood && user && !isLoading) {
      fetchRecommendation(selectedMood, user, budget, customPrompts);
    }
  }, [budget, selectedMood, user, customPrompts]);

  useEffect(() => {
    if (shouldScrollRef.current && !isLoading && recommendation) {
      if (recommendationRef.current) {
        const yOffset = -20;
        const element = recommendationRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({
          top: y,
          behavior: 'smooth'
        });
      }
      shouldScrollRef.current = false;
    }
  }, [isLoading, recommendation]);

  const handleMoodSelect = async (mood: Mood) => {
    if (mood === previousMoodRef.current) {
      return;
    }

    if (!user?.location) {
      await handleLocationSubmit();
      if (!user?.location) return;
    }
    
    previousMoodRef.current = mood;
    setSelectedMood(mood);
    shouldScrollRef.current = true;
    
    if (user) {
      try {
        await fetchRecommendation(mood, user, budget, customPrompts);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    }
  };

  const handlePromptSubmit = async (prompts: typeof customPrompts) => {
    setCustomPrompts(prompts);
    if (selectedMood && user) {
      try {
        shouldScrollRef.current = true;
        await fetchRecommendation(selectedMood, user, budget, prompts);
      } catch (error) {
        console.error('Error updating recommendations:', error);
      }
    }
  };

  return (
    <div className="min-h-screen ios-safe-area relative">
      <Background />
      
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <MoodHeader user={user} appName={APP_NAME} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {needsLocation && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm z-10">
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mt-1" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Location Access
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  To provide personalized recommendations and find events near you, we need your location.
                </p>
              </div>
            </div>
            
            {locationError && (
              <div className="mb-4">
                <p className="text-sm text-red-600 mb-2">{locationError}</p>
                <p className="text-sm text-gray-600">
                  Don't worry! You can still use the app by manually entering your city below.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <Button
                onClick={handleLocationSubmit}
                loading={locationLoading}
                disabled={locationLoading}
              >
                {locationLoading ? 'Getting Location...' : 'Share Location'}
              </Button>

              {locationError && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>
              )}

              {locationError && (
                <LocationFallback
                  onSubmit={handleManualLocation}
                  isLoading={locationLoading}
                />
              )}
            </div>
          </div>
        )}

        {useDefaultLocation && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-700">
              Using approximate location. Your recommendations may not be as accurate. You can update your location anytime.
            </p>
          </div>
        )}

        <div className="mt-6 sm:mt-8 space-y-8 sm:space-y-12">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
              Set Your Budget
            </h2>
            <BudgetSlider value={budget} onChange={setBudget} />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
              How are you feeling today?
            </h2>
            <MoodSelector
              selectedMood={selectedMood}
              onMoodSelect={handleMoodSelect}
              disabled={isLoading || locationLoading}
            />
          </div>

          {selectedMood && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  Customize Your Experience
                </h2>
              </div>
              <div ref={customizeRef}>
                <RecommendationPrompt
                  onSubmit={handlePromptSubmit}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 sm:mt-8 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm sm:text-base text-red-600">{error}</p>
          </div>
        )}

        <div ref={recommendationRef}>
          {recommendation && selectedMood && user && (
            <MoodRecommendation
              mood={selectedMood}
              recommendation={recommendation}
              userId={user.id}
            />
          )}

          {events && events.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Events Near You
              </h2>
              <EventList 
                events={events}
                isLoading={eventsLoading}
                error={eventsError}
                userId={user?.id}
                currentMood={selectedMood}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MoodPage;