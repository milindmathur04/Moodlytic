import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../../services/auth/auth';
import { useUserStore } from '../../store/userStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ROUTES } from '../../constants/app';

export function LoginForm() {
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, profile } = await signIn(email, password);
      
      if (profile) {
        setUser(profile);
        
        // Check if profile is complete
        const isProfileComplete = Boolean(
          profile.age &&
          profile.gender &&
          profile.nationality &&
          profile.language
        );

        // Navigate based on profile completion status
        if (isProfileComplete) {
          navigate(ROUTES.MOOD);
        } else {
          navigate(ROUTES.PROFILE_SETUP);
        }
      } else {
        throw new Error('Failed to load user profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Input
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isLoading}
      />

      <Input
        type="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isLoading}
      />

      <Button
        type="submit"
        fullWidth
        loading={isLoading}
        disabled={isLoading}
      >
        Sign In
      </Button>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="text-blue-500 hover:underline"
        >
          Sign Up
        </button>
      </p>
    </form>
  );
}