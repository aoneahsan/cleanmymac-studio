import React from 'react';
import { Button, ButtonProps } from 'primereact/button';
import { useSoundEffect } from '@renderer/lib/soundEffects';

interface SoundButtonProps extends ButtonProps {
  soundType?: 'click' | 'success' | 'error' | 'unlock';
}

export function SoundButton({ 
  onClick, 
  soundType = 'click',
  disabled,
  ...props 
}: SoundButtonProps) {
  const { playSound, settings } = useSoundEffect();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && settings.enabled) {
      playSound(soundType);
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={disabled}
    />
  );
}