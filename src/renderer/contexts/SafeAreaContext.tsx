import React, { createContext, useContext, useEffect, useState } from 'react';

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface SafeAreaContextValue {
  insets: SafeAreaInsets;
  isElectron: boolean;
  hasNotch: boolean;
  titlebarHeight: number;
}

const SafeAreaContext = createContext<SafeAreaContextValue>({
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  isElectron: false,
  hasNotch: false,
  titlebarHeight: 28, // Default macOS titlebar height
});

export const useSafeArea = () => useContext(SafeAreaContext);

interface SafeAreaProviderProps {
  children: React.ReactNode;
}

export function SafeAreaProvider({ children }: SafeAreaProviderProps) {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  const [hasNotch, setHasNotch] = useState(false);
  const isElectron = typeof window !== 'undefined' && !!window.electron;

  useEffect(() => {
    // Detect if running in Electron
    if (isElectron) {
      // macOS titlebar area
      setInsets({
        top: 28, // Standard macOS titlebar height
        right: 0,
        bottom: 0,
        left: 0,
      });

      // Check for notch (MacBook Pro 14" and 16" with notch)
      if (window.screen.height >= 982 && window.devicePixelRatio >= 2) {
        setHasNotch(true);
        setInsets({
          top: 38, // Extra space for notch
          right: 0,
          bottom: 0,
          left: 0,
        });
      }
    } else {
      // Web browser safe areas
      const computeSafeArea = () => {
        const style = getComputedStyle(document.documentElement);
        setInsets({
          top: parseInt(style.getPropertyValue('--sat') || '0'),
          right: parseInt(style.getPropertyValue('--sar') || '0'),
          bottom: parseInt(style.getPropertyValue('--sab') || '0'),
          left: parseInt(style.getPropertyValue('--sal') || '0'),
        });
      };

      computeSafeArea();
      window.addEventListener('resize', computeSafeArea);
      return () => window.removeEventListener('resize', computeSafeArea);
    }
  }, [isElectron]);

  const titlebarHeight = insets.top || 28;

  return (
    <SafeAreaContext.Provider 
      value={{ 
        insets, 
        isElectron, 
        hasNotch,
        titlebarHeight 
      }}
    >
      {children}
    </SafeAreaContext.Provider>
  );
}

// CSS helper classes for safe areas
export const safeAreaClasses = {
  top: 'pt-safe-top',
  right: 'pr-safe-right',
  bottom: 'pb-safe-bottom',
  left: 'pl-safe-left',
  all: 'p-safe',
  horizontal: 'px-safe',
  vertical: 'py-safe',
};