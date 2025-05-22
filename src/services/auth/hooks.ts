import { useGoogleLogin } from '@react-oauth/google';
import { createGoogleAuthConfig } from './google';

export function useAuth() {
  const config = createGoogleAuthConfig();
  
  const login = useGoogleLogin({
    ...config,
    onError: (error) => {
      console.error('Google login error:', error);
    }
  });

  return { login };
}