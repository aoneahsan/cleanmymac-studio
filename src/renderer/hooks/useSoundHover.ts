import { useRef } from 'react';
import { useSoundEffect } from '@renderer/lib/soundEffects';

export function useSoundHover() {
  const { playSound, settings } = useSoundEffect();
  const hasPlayedRef = useRef(false);

  const onMouseEnter = () => {
    if (settings.enabled && !hasPlayedRef.current) {
      playSound('hover');
      hasPlayedRef.current = true;
    }
  };

  const onMouseLeave = () => {
    hasPlayedRef.current = false;
  };

  return {
    onMouseEnter,
    onMouseLeave,
  };
}