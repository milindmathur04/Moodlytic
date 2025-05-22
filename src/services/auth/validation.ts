import { REQUIRED_SCOPES } from '../../config/oauth';

export function validateGoogleToken(tokenResponse: any) {
  // Validate token has required scopes
  const grantedScopes = (tokenResponse.scope || '').split(' ');
  const hasSufficientScopes = REQUIRED_SCOPES.every(
    scope => grantedScopes.includes(scope)
  );
  
  if (!hasSufficientScopes) {
    throw new Error('Insufficient permissions granted');
  }

  // Validate state to prevent CSRF
  const expectedState = sessionStorage.getItem('oauth_state');
  if (tokenResponse.state !== expectedState) {
    throw new Error('Invalid state parameter');
  }
}

export function storeOAuthState(state: string) {
  sessionStorage.setItem('oauth_state', state);
}

export function clearOAuthState() {
  sessionStorage.removeItem('oauth_state');
}