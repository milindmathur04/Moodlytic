import React, { useState, useCallback } from 'react';
import { PREFERENCE_QUESTIONS } from '../../constants/preferences';
import type { PreferenceQuestion } from '../../types/preferences';
import { Button } from '../ui/Button';

interface PreferenceQuestionnaireProps {
  onComplete: (preferences: Array<{ mood: string; category: string; preference: string }>) => Promise<void>;
  isLoading?: boolean;
}

export function PreferenceQuestionnaire({ onComplete, isLoading = false }: PreferenceQuestionnaireProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedPreferences, setSelectedPreferences] = useState<Array<{ mood: string; category: string; preference: string }>>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = PREFERENCE_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === PREFERENCE_QUESTIONS.length - 1;

  const handleNext = useCallback(async () => {
    if (!selectedOption || !currentQuestion) {
      setError('Please select an option to continue');
      return;
    }

    try {
      setError(null);
      const newPreference = {
        mood: currentQuestion.mood,
        category: currentQuestion.category,
        preference: selectedOption
      };

      const updatedPreferences = [...selectedPreferences, newPreference];

      if (isLastQuestion) {
        try {
          await onComplete(updatedPreferences);
        } catch (err) {
          console.error('Error completing preferences:', err);
          throw err;
        }
      } else {
        setSelectedPreferences(updatedPreferences);
        setSelectedOption(null);
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error handling next:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  }, [currentQuestion, selectedOption, selectedPreferences, isLastQuestion, onComplete]);

  const handleOptionSelect = useCallback((optionId: string) => {
    if (!isLoading) {
      setSelectedOption(optionId);
      setError(null);
    }
  }, [isLoading]);

  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No more questions available.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Help Us Personalize Your Experience
          </h2>
          <span className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {PREFERENCE_QUESTIONS.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / PREFERENCE_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-xl font-medium text-gray-900 mb-6">
          {currentQuestion.question}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentQuestion.options.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleOptionSelect(option.id)}
              disabled={isLoading}
              className={`relative overflow-hidden rounded-xl transition-all duration-200 ${
                selectedOption === option.id
                  ? 'ring-2 ring-blue-500 scale-[1.02]'
                  : 'hover:scale-[1.01]'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="aspect-[4/3] relative">
                <img
                  src={option.image}
                  alt={option.text}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-medium">{option.text}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!selectedOption || isLoading}
          loading={isLoading}
          fullWidth
        >
          {isLastQuestion ? 'Complete' : 'Next Question'}
        </Button>
      </div>
    </div>
  );
}