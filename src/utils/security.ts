export function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateState(receivedState: string | null): boolean {
  const storedState = sessionStorage.getItem('oauth_state');
  return !!storedState && !!receivedState && storedState === receivedState;
}