import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface SoundContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  playHover: () => void;
  playClick: () => void;
  playClose: () => void;
  playVoice: (characterId: string, lang: string) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);
  const closeAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    hoverAudioRef.current = new Audio('/audio/hover.wav');
    hoverAudioRef.current.volume = 0.4;
    
    clickAudioRef.current = new Audio('/audio/click.wav');
    clickAudioRef.current.volume = 0.5;
    
    closeAudioRef.current = new Audio('/audio/close.wav');
    closeAudioRef.current.volume = 0.5;
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const playHover = () => {
    if (!soundEnabled || !hoverAudioRef.current) return;
    hoverAudioRef.current.currentTime = 0;
    hoverAudioRef.current.play().catch(e => console.warn('Audio play blocked:', e));
  };

  const playClick = () => {
    if (!soundEnabled || !clickAudioRef.current) return;
    clickAudioRef.current.currentTime = 0;
    clickAudioRef.current.play().catch(e => console.warn('Audio play blocked:', e));
  };

  const playClose = () => {
    if (!soundEnabled || !closeAudioRef.current) return;
    closeAudioRef.current.currentTime = 0;
    closeAudioRef.current.play().catch(e => console.warn('Audio play blocked:', e));
  };

  const playVoice = (characterId: string, lang: string) => {
    if (!soundEnabled) return;
    
    const audioLang = lang === 'ja' ? 'ja' : 'en';
    
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current.currentTime = 0;
    }
    
    const voiceUrl = `/audio/voices/${characterId.toLowerCase()}_${audioLang}.wav`;
    voiceAudioRef.current = new Audio(voiceUrl);
    voiceAudioRef.current.volume = 0.8;
    voiceAudioRef.current.play().catch(e => console.warn('Voice play blocked:', e));
  };

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, playHover, playClick, playClose, playVoice }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
