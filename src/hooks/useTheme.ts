// useTheme.ts — Reusable dark mode detection hook (DRY)
// Replaces duplicated MutationObserver in BaseNode and DraggableNode

import { useState, useEffect } from 'react';

export const useTheme = (): boolean => {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const check = (): void => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
};
