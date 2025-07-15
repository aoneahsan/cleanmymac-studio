import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Sound effect types
export type SoundEffectType = 
  | 'click'
  | 'hover'
  | 'success'
  | 'error'
  | 'warning'
  | 'scanStart'
  | 'scanProgress'
  | 'scanComplete'
  | 'cleanStart'
  | 'cleanComplete'
  | 'notification'
  | 'unlock'
  | 'transition'
  | 'delete';

interface SoundSettings {
  enabled: boolean;
  volume: number;
}

interface SoundEffectsStore {
  settings: SoundSettings;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
}

export const useSoundEffectsStore = create<SoundEffectsStore>()(
  persist(
    (set) => ({
      settings: {
        enabled: true,
        volume: 0.5,
      },
      setEnabled: (enabled) =>
        set((state) => ({
          settings: { ...state.settings, enabled },
        })),
      setVolume: (volume) =>
        set((state) => ({
          settings: { ...state.settings, volume },
        })),
    }),
    {
      name: 'sound-effects-storage',
    }
  )
);

// Audio context for Web Audio API
let audioContext: AudioContext | null = null;

// Initialize audio context
function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Generate synthetic sounds using Web Audio API
function generateSound(type: SoundEffectType): OscillatorNode | null {
  const ctx = initAudioContext();
  if (!ctx) return null;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  const { settings } = useSoundEffectsStore.getState();
  gainNode.gain.value = settings.volume * 0.1; // Scale down for comfort

  const currentTime = ctx.currentTime;

  switch (type) {
    case 'click':
      oscillator.frequency.setValueAtTime(600, currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.05);
      break;
      
    case 'hover':
      oscillator.frequency.setValueAtTime(800, currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1000, currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.02);
      break;
      
    case 'success':
      oscillator.frequency.setValueAtTime(400, currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(800, currentTime + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
      break;
      
    case 'error':
      oscillator.frequency.setValueAtTime(200, currentTime);
      oscillator.frequency.setValueAtTime(150, currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);
      break;
      
    case 'warning':
      oscillator.frequency.setValueAtTime(440, currentTime);
      oscillator.frequency.setValueAtTime(349, currentTime + 0.1);
      oscillator.frequency.setValueAtTime(440, currentTime + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
      break;
      
    case 'scanStart':
    case 'cleanStart':
      oscillator.frequency.setValueAtTime(440, currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, currentTime + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
      break;
      
    case 'scanProgress':
      oscillator.frequency.setValueAtTime(600, currentTime);
      oscillator.frequency.setValueAtTime(650, currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);
      break;
      
    case 'scanComplete':
    case 'cleanComplete':
      oscillator.frequency.setValueAtTime(523, currentTime); // C5
      oscillator.frequency.setValueAtTime(659, currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(784, currentTime + 0.2); // G5
      oscillator.frequency.setValueAtTime(1047, currentTime + 0.3); // C6
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.4);
      break;
      
    case 'notification':
      oscillator.frequency.setValueAtTime(880, currentTime);
      oscillator.frequency.setValueAtTime(1100, currentTime + 0.05);
      oscillator.frequency.setValueAtTime(880, currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);
      break;
      
    case 'unlock':
      oscillator.frequency.setValueAtTime(660, currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1320, currentTime + 0.1);
      oscillator.frequency.setValueAtTime(990, currentTime + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.25);
      break;
      
    case 'transition':
      oscillator.frequency.setValueAtTime(440, currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(550, currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);
      break;
      
    case 'delete':
      oscillator.frequency.setValueAtTime(440, currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(110, currentTime + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.25);
      break;
      
    default:
      oscillator.frequency.setValueAtTime(440, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);
  }

  return oscillator;
}

// Play sound effect
export function playSound(type: SoundEffectType) {
  const { settings } = useSoundEffectsStore.getState();
  
  if (!settings.enabled || settings.volume === 0) {
    return;
  }

  try {
    const oscillator = generateSound(type);
    if (oscillator) {
      oscillator.start();
      oscillator.stop(initAudioContext()!.currentTime + 0.5); // Max duration
    }
  } catch (error) {
    console.warn('Failed to play sound effect:', error);
  }
}

// React hook for playing sounds
export function useSoundEffect() {
  return {
    playSound,
    ...useSoundEffectsStore(),
  };
}