import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Background } from '../ui/Background';
import { ProfileEditor } from './ProfileEditor';
import { PreferenceQuestionnaire } from '../preferences/PreferenceQuestionnaire';
import { useUserStore } from '../../store/userStore';
import { ROUTES } from '../../constants/app';

type SetupStep = 'profile' | 'preferences';

export function ProfileSetup() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [currentStep, setCurrentStep] = useState<SetupStep>('profile');

  const handleProfileComplete = () => {
    setCurrentStep('preferences');
  };

  const handlePreferencesComplete = async (preferences: Array<{ mood: string; category: string; preference: string }>) => {
    // Navigate to mood page after preferences are saved
    navigate(ROUTES.MOOD);
  };

  if (!user) {
    navigate(ROUTES.LOGIN);
    return null;
  }

  return (
    <div className="min-h-screen ios-safe-area px-4 py-8 relative overflow-hidden">
      <Background />
      
      <Card className="max-w-2xl mx-auto mt-12 p-8 bg-white/80 backdrop-blur-sm">
        <div className="text-center space-y-6 mb-8">
          {currentStep === 'profile' ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">
                Complete Your Profile
              </h1>
              <p className="text-gray-600">
                Please provide some additional information to personalize your experience.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">
                Set Your Preferences
              </h1>
              <p className="text-gray-600">
                Help us understand your interests better.
              </p>
            </>
          )}
        </div>
        
        {currentStep === 'profile' ? (
          <ProfileEditor onClose={handleProfileComplete} isRequired={true} />
        ) : (
          <PreferenceQuestionnaire onComplete={handlePreferencesComplete} />
        )}
      </Card>
    </div>
  );
}