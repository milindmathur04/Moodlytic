import { isSafari as checkSafari } from './browser';

export const SAFARI_INSTRUCTIONS = `To enable location access in Safari:

1. Check your iOS Settings:
   - Go to Settings > Privacy > Location Services
   - Make sure Location Services is ON
   - Find Safari in the list and set to "While Using"

2. In Safari browser:
   - Tap the "aA" button in the address bar
   - Select "Website Settings"
   - Allow location access
   - Refresh the page

If you still don't see the location prompt, please check your device's location settings.`;

export function isSafari(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export function isMobileSafari(): boolean {
  return isSafari() && /iPhone|iPod|iPad/.test(navigator.userAgent);
}

export function handleSafariPermissionDenied(): void {
  if (isMobileSafari()) {
    alert(SAFARI_INSTRUCTIONS);
  }
}