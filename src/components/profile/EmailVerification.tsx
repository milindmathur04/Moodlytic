import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { resendVerificationEmail } from '../../services/auth/auth';
import { cn } from '../../lib/utils';

interface EmailVerificationProps {
  email: string;
}

export function EmailVerification({ email }: EmailVerificationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      setMessage(null);

      await resendVerificationEmail(email);
      setMessage('Verification email sent! Please check your inbox.');
    } catch (err) {
      console.error('Failed to resend verification:', err);
      setMessage(err instanceof Error ? err.message : 'Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-500" />
        <h3 className="text-sm font-medium text-yellow-700">Email Not Verified</h3>
      </div>
      
      <p className="text-xs text-gray-600">
        Please verify your email address to access all features.
      </p>
      
      {message && (
        <p className="text-xs text-yellow-600">{message}</p>
      )}

      <button
        onClick={handleResendVerification}
        disabled={isLoading}
        className={cn(
          "w-full h-8 text-xs font-medium rounded-lg transition-all duration-200",
          "bg-gradient-to-r from-yellow-500 to-yellow-600",
          "text-white shadow-sm hover:shadow-md hover:scale-[1.02]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
          "relative overflow-hidden"
        )}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          "Resend Verification Email"
        )}
      </button>
    </div>
  );
}