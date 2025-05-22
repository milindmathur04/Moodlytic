import { useCallback } from 'react';

export function useScrollToElement() {
  return useCallback((element: HTMLElement | null) => {
    if (!element) return;
    
    const offset = 20; // Add some padding from the top
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }, []);
}