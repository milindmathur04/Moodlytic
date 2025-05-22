export function isSafari(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export function reloadPageIfSafari(): void {
  if (isSafari()) {
    window.location.reload();
  }
}