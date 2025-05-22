import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { handleGoogleCallback } from '../../services/auth/google-auth';
import { ROUTES } from '../../constants/app';

export function OAuthCallback() {
  const navigate = useNavigate();
  const { initializeUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function processCallback() {
      try {
        const { data } = await handleGoogleCallback();
        
        if (!data.session?.user) {
          throw new Error('Authentication failed');
        }

        const profile = await initializeUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          given_name: data.session.user.user_metadata?.full_name,
          picture: data.session.user.user_metadata?.avatar_url
        });

        if (profile) {
          // Check if profile is complete
          const isProfileComplete = Boolean(
            profile.age &&
            profile.gender &&
            profile.nationality &&
            profile.language
          );

          // Navigate based on profile completion
          if (isProfileComplete) {
            navigate(ROUTES.MOOD, { replace: true });
          } else {
            navigate(ROUTES.PROFILE_SETUP, { replace: true });
          }
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError('Authentication failed. Please try again.');
        navigate(ROUTES.LOGIN, { replace: true });
      } finally {
        setIsLoading(false);
      }
    }

    processCallback();
  }, [navigate, initializeUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ios-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ios-blue mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">
            Completing authentication...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ios-background px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return null;
}