import React from 'react';
import { initializeGoogleAuth } from '../../services/auth/google-auth';
import { cn } from '../../lib/utils';

interface GoogleButtonProps {
  disabled?: boolean;
}

export function GoogleButton({ disabled }: GoogleButtonProps) {
  const handleLogin = async () => {
    try {
      await initializeGoogleAuth();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={disabled}
      className={cn(
        'w-full h-[50px] flex items-center justify-center gap-3',
        'bg-white rounded-2xl text-[17px] font-medium',
        'shadow-sm transition-all duration-200',
        'border-[1.5px] border-ios-gray4',
        'hover:bg-gray-50 active:bg-gray-100',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-ios-blue focus:ring-offset-2'
      )}
    >
      <svg width="20" height="20" viewBox="0 0 18 18">
        <path
          fill="#4285f4"
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        />
        <path
          fill="#34a853"
          d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
        />
        <path
          fill="#fbbc05"
          d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        />
        <path
          fill="#ea4335"
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        />
      </svg>
      <span className="text-[#1a73e8]">Continue with Google</span>
    </button>
  );
}