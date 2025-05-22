import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { MoodPage } from './components/MoodPage';
import { GroupsPage } from './components/groups/GroupsPage';
import { ProfileSetup } from './components/profile/ProfileSetup';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useUserStore } from './store/userStore';
import { checkExistingSession } from './services/auth/session';
import { ROUTES } from './constants/app';

export default function App() {
  const { user, setUser } = useUserStore();

  useEffect(() => {
    const initSession = async () => {
      try {
        const profile = await checkExistingSession();
        if (profile) {
          setUser(profile);
        }
      } catch (error) {
        console.error('Session initialization error:', error);
      }
    };

    initSession();
  }, [setUser]);

  // Check if user has complete profile
  const isProfileComplete = user && Boolean(
    user.age &&
    user.gender &&
    user.nationality &&
    user.language
  );

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route 
            path="/profile-setup" 
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mood"
            element={
              <ProtectedRoute>
                <MoodPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/" 
            element={
              user ? (
                isProfileComplete ? (
                  <Navigate to="/mood" replace />
                ) : (
                  <Navigate to="/profile-setup" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}