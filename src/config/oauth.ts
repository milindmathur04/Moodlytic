import { generateState } from '../utils/security';

export const OAUTH_CONFIG = {
  flow: 'implicit',
  access_type: 'offline',
  prompt: 'consent',
  scope: 'openid email profile',
  redirectTo: window.location.origin
} as const;

export const REQUIRED_SCOPES = ['openid', 'email', 'profile'];