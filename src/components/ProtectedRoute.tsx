import React, { useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { ROUTES } from '../constants/app';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserStore();

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }

    const isProfileComplete = Boolean(
      user.age &&
      user.gender &&
      user.nationality &&
      user.language
    );

    // Only redirect to profile setup if profile is incomplete
    // and not already on a setup-related page
    if (!isProfileComplete && 
        ![ROUTES.PROFILE_SETUP, ROUTES.PREFERENCES, ROUTES.LOGIN, ROUTES.SIGNUP].includes(location.pathname)) {
      navigate(ROUTES.PROFILE_SETUP);
    }
  }, [user, navigate, location.pathname]);

  if (!user) return null;
  return <>{children}</>;
}