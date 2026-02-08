import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Howl } from 'howler';

type SoundType = 'click' | 'correct' | 'wrong' | 'win' | 'lose' | 'tick' | 'timeout' | 'battleStart' | 'quizStart';

interface AudioContextType {
  isMusicEnabled: boolean;
  isSfxEnabled: boolean;
  toggleMusic: () => void;
  toggleSfx: () => void;
  playSound: (sound: SoundType) => void;
  startBackgroundMusic: (type: 'menu' | 'quiz' | 'battle') => void;
  stopBackgroundMusic: () => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

const MUSIC_URLS: Record<string, string> = {
  menu: '/audio/menu.mp3',
  quiz: '/audio/quiz.mp3',
  battle: '/audio/battle.mp3'
};

function createSynthSound(
  audioContext: globalThis.AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3,
  attackTime: number = 0.01,
  decayTime: number = 0.1
) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + attackTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration - decayTime);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

function playCorrectSound(audioContext: globalThis.AudioContext, volume: number) {
  createSynthSound(audioContext, 523.25, 0.1, 'sine', volume); // C5
  setTimeout(() => createSynthSound(audioContext, 659.25, 0.1, 'sine', volume), 80); // E5
  setTimeout(() => createSynthSound(audioContext, 783.99, 0.2, 'sine', volume), 160); // G5
}

function playWrongSound(audioContext: globalThis.AudioContext, volume: number) {
  createSynthSound(audioContext, 200, 0.15, 'sawtooth', volume * 0.5);
  setTimeout(() => createSynthSound(audioContext, 150, 0.25, 'sawtooth', volume * 0.5), 100);
}

function playClickSound(audioContext: globalThis.AudioContext, volume: number) {
  createSynthSound(audioContext, 800, 0.05, 'sine', volume * 0.4);
}

function playTickSound(audioContext: globalThis.AudioContext, volume: number) {
  createSynthSound(audioContext, 1000, 0.08, 'square', volume * 0.3);
}

function playTimeoutSound(audioContext: globalThis.AudioContext, volume: number) {
  createSynthSound(audioContext, 300, 0.2, 'sawtooth', volume * 0.6);
  setTimeout(() => createSynthSound(audioContext, 200, 0.3, 'sawtooth', volume * 0.5), 150);
}

function playWinSound(audioContext: globalThis.AudioContext, volume: number) {
  const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
  notes.forEach((freq, i) => {
    setTimeout(() => createSynthSound(audioContext, freq, 0.15, 'sine', volume * 0.6), i * 80);
  });
}

function playLoseSound(audioContext: globalThis.AudioContext, volume: number) {
  createSynthSound(audioContext, 392, 0.2, 'triangle', volume * 0.5);
  setTimeout(() => createSynthSound(audioContext, 349.23, 0.2, 'triangle', volume * 0.5), 150);
  setTimeout(() => createSynthSound(audioContext, 293.66, 0.4, 'triangle', volume * 0.4), 300);
}

function playBattleStartSound(audioContext: globalThis.AudioContext, volume: number) {
  createSynthSound(audioContext, 261.63, 0.15, 'square', volume * 0.4);
  setTimeout(() => createSynthSound(audioContext, 329.63, 0.15, 'square', volume * 0.4), 100);
  setTimeout(() => createSynthSound(audioContext, 392, 0.15, 'square', volume * 0.4), 200);
  setTimeout(() => createSynthSound(audioContext, 523.25, 0.3, 'square', volume * 0.5), 300);
}

function playQuizStartSound(audioContext: globalThis.AudioContext, volume: number) {
  createSynthSound(audioContext, 440, 0.1, 'sine', volume * 0.4);
  setTimeout(() => createSynthSound(audioContext, 554.37, 0.1, 'sine', volume * 0.4), 100);
  setTimeout(() => createSynthSound(audioContext, 659.25, 0.2, 'sine', volume * 0.5), 200);
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isMusicEnabled, setIsMusicEnabled] = useState(() => {
    const saved = localStorage.getItem('musicEnabled');
    return saved !== null ? saved === 'true' : true;
  });
  
  const [isSfxEnabled, setIsSfxEnabled] = useState(() => {
    const saved = localStorage.getItem('sfxEnabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [musicVolume, setMusicVolumeState] = useState(0.3);
  const [sfxVolume, setSfxVolumeState] = useState(0.5);
  
  const backgroundMusicRef = useRef<Howl | null>(null);
  const currentMusicTypeRef = useRef<string | null>(null);
  const pendingMusicTypeRef = useRef<string | null>(null);
  const hasUserInteractedRef = useRef(false);
  const webAudioContextRef = useRef<globalThis.AudioContext | null>(null);

  const getWebAudioContext = useCallback(() => {
    if (!webAudioContextRef.current) {
      webAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (webAudioContextRef.current.state === 'suspended') {
      webAudioContextRef.current.resume();
    }
    return webAudioContextRef.current;
  }, []);

  const actuallyPlayMusic = useCallback((type: string) => {
    if (currentMusicTypeRef.current === type && backgroundMusicRef.current?.playing()) {
      return;
    }

    backgroundMusicRef.current?.stop();
    backgroundMusicRef.current?.unload();

    const musicUrl = MUSIC_URLS[type];
    if (!musicUrl) return;

    backgroundMusicRef.current = new Howl({
      src: [musicUrl],
      volume: musicVolume,
      loop: true,
      html5: true,
      preload: true
    });
    
    currentMusicTypeRef.current = type;

    if (isMusicEnabled) {
      backgroundMusicRef.current.once('load', () => {
        backgroundMusicRef.current?.play();
      });
    }
  }, [isMusicEnabled, musicVolume]);

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasUserInteractedRef.current) {
        hasUserInteractedRef.current = true;
        if (pendingMusicTypeRef.current && isMusicEnabled) {
          actuallyPlayMusic(pendingMusicTypeRef.current);
        }
      }
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [actuallyPlayMusic, isMusicEnabled]);

  useEffect(() => {
    localStorage.setItem('musicEnabled', String(isMusicEnabled));
    if (!isMusicEnabled) {
      backgroundMusicRef.current?.pause();
    } else if (backgroundMusicRef.current && currentMusicTypeRef.current) {
      if (backgroundMusicRef.current.state() === 'loaded') {
        backgroundMusicRef.current.play();
      }
    }
  }, [isMusicEnabled]);

  useEffect(() => {
    localStorage.setItem('sfxEnabled', String(isSfxEnabled));
  }, [isSfxEnabled]);

  useEffect(() => {
    backgroundMusicRef.current?.volume(musicVolume);
  }, [musicVolume]);

  const playSound = useCallback((sound: SoundType) => {
    if (!isSfxEnabled) return;
    
    try {
      const ctx = getWebAudioContext();
      
      switch (sound) {
        case 'click':
          playClickSound(ctx, sfxVolume);
          break;
        case 'correct':
          playCorrectSound(ctx, sfxVolume);
          break;
        case 'wrong':
          playWrongSound(ctx, sfxVolume);
          break;
        case 'tick':
          playTickSound(ctx, sfxVolume);
          break;
        case 'timeout':
          playTimeoutSound(ctx, sfxVolume);
          break;
        case 'win':
          playWinSound(ctx, sfxVolume);
          break;
        case 'lose':
          playLoseSound(ctx, sfxVolume);
          break;
        case 'battleStart':
          playBattleStartSound(ctx, sfxVolume);
          break;
        case 'quizStart':
          playQuizStartSound(ctx, sfxVolume);
          break;
      }
    } catch (e) {
      console.warn('Could not play sound:', e);
    }
  }, [isSfxEnabled, sfxVolume, getWebAudioContext]);

  const startBackgroundMusic = useCallback((type: 'menu' | 'quiz' | 'battle') => {
    pendingMusicTypeRef.current = type;
    
    if (hasUserInteractedRef.current) {
      actuallyPlayMusic(type);
    }
  }, [actuallyPlayMusic]);

  const stopBackgroundMusic = useCallback(() => {
    backgroundMusicRef.current?.stop();
    currentMusicTypeRef.current = null;
    pendingMusicTypeRef.current = null;
  }, []);

  const toggleMusic = useCallback(() => {
    setIsMusicEnabled(prev => !prev);
  }, []);

  const toggleSfx = useCallback(() => {
    setIsSfxEnabled(prev => !prev);
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    setMusicVolumeState(volume);
  }, []);

  const setSfxVolume = useCallback((volume: number) => {
    setSfxVolumeState(volume);
  }, []);

  return (
    <AudioContext.Provider value={{
      isMusicEnabled,
      isSfxEnabled,
      toggleMusic,
      toggleSfx,
      playSound,
      startBackgroundMusic,
      stopBackgroundMusic,
      setMusicVolume,
      setSfxVolume
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
