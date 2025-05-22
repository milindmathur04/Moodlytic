import { OAUTH_CONFIG } from '../../config/oauth';

const domain = window.location.origin;

export const GOOGLE_AUTH_CONFIG = {
  ...OAUTH_CONFIG,
  flow: 'implicit',
  ux_mode: 'popup',
  redirect_uri: `${domain}/oauth-callback`,
  onSuccess: (response: any) => {
    // Store token temporarily
    sessionStorage.setItem('temp_token', response.access_token);
    window.location.href = `${domain}/oauth-callback`;
  },
} as const;