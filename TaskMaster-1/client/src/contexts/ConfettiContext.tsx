import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type ConfettiShape = 'square' | 'circle' | 'star' | 'heart' | 'triangle' | 'diamond';

export interface ConfettiSettings {
  enabled: boolean;
  duration: number;
  numberOfPieces: number;
  colors: string[];
  recycle: boolean;
  shape: ConfettiShape;
}

interface ConfettiContextType {
  settings: ConfettiSettings;
  updateSettings: (newSettings: ConfettiSettings) => void;
  showConfetti: () => void;
  hideConfetti: () => void;
  isConfettiActive: boolean;
}

// Default confetti settings
export const defaultConfettiSettings: ConfettiSettings = {
  enabled: true,
  duration: 3000,
  numberOfPieces: 200,
  colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
  recycle: false,
  shape: 'square',
};

// Create the context
const ConfettiContext = createContext<ConfettiContextType | undefined>(undefined);

// Provider component
export const ConfettiProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<ConfettiSettings>(() => {
    // Try to load settings from localStorage
    const savedSettings = localStorage.getItem('confettiSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Failed to parse saved confetti settings:', e);
      }
    }
    return defaultConfettiSettings;
  });
  
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('confettiSettings', JSON.stringify(settings));
  }, [settings]);
  
  const updateSettings = (newSettings: ConfettiSettings) => {
    setSettings(newSettings);
  };
  
  const showConfetti = () => {
    if (settings.enabled) {
      setIsConfettiActive(true);
      
      // If not recycling (continuous), automatically hide after duration
      if (!settings.recycle && settings.duration > 0) {
        setTimeout(() => {
          setIsConfettiActive(false);
        }, settings.duration);
      }
    }
  };
  
  const hideConfetti = () => {
    setIsConfettiActive(false);
  };
  
  return (
    <ConfettiContext.Provider value={{
      settings,
      updateSettings,
      showConfetti,
      hideConfetti,
      isConfettiActive
    }}>
      {children}
    </ConfettiContext.Provider>
  );
};

// Custom hook to use the confetti context
export const useConfetti = () => {
  const context = useContext(ConfettiContext);
  if (context === undefined) {
    throw new Error('useConfetti must be used within a ConfettiProvider');
  }
  return context;
};