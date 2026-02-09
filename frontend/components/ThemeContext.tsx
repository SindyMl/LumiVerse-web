import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SECTION_COLORS: Record<string, { color: string; accent: string }> = {
  law: { color: '#00008B', accent: '#FFD700' },
  history: { color: '#8B4513', accent: '#F4A460' },
  poetry: { color: '#228B22', accent: '#EEE8AA' },
  prophets: { color: '#4B0082', accent: '#FF4500' },
  gospels: { color: '#DC143C', accent: '#FFFFFF' },
  acts: { color: '#87CEEB', accent: '#FFD700' },
  epistles: { color: '#008080', accent: '#FFFFFF' },
  revelation: { color: '#301934', accent: '#FF0000' },
};

export const HIGHLIGHT_COLORS = [
  '#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F97316', '#34D399',
];

const lightTheme = {
  dark: false,
  background: '#F5F2E9',
  backgroundSecondary: '#EAE5D9',
  foreground: '#2A2A2A',
  primary: '#C5A059',
  primaryForeground: '#FFFFFF',
  accent: '#3B82F6',
  border: '#D4C5A9',
  surface: '#FFFFFF',
  surfaceAlpha: 'rgba(255,255,255,0.85)',
  textMuted: '#7A7062',
  goldGlow: 'rgba(197,160,89,0.3)',
};

const darkTheme = {
  dark: true,
  background: '#02040A',
  backgroundSecondary: '#0A0A0A',
  foreground: '#E0E0E0',
  primary: '#FFD700',
  primaryForeground: '#000000',
  accent: '#1E90FF',
  border: '#333333',
  surface: '#121212',
  surfaceAlpha: 'rgba(18,18,18,0.9)',
  textMuted: '#888888',
  goldGlow: 'rgba(255,215,0,0.4)',
};

export type ThemeType = typeof lightTheme;

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  toggleTheme: () => void;
  fontSize: number;
  setFontSize: (s: number) => void;
  userId: string;
  setUserId: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  fontSize: 16,
  setFontSize: () => {},
  userId: '',
  setUserId: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    try {
      const dark = await AsyncStorage.getItem('isDark');
      const fs = await AsyncStorage.getItem('fontSize');
      const uid = await AsyncStorage.getItem('userId');
      if (dark !== null) setIsDark(dark === 'true');
      if (fs !== null) setFontSize(parseInt(fs, 10));
      if (uid) setUserId(uid);
    } catch {}
  };

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem('isDark', String(next));
  };

  const updateFontSize = async (s: number) => {
    setFontSize(s);
    await AsyncStorage.setItem('fontSize', String(s));
  };

  const updateUserId = async (id: string) => {
    setUserId(id);
    await AsyncStorage.setItem('userId', id);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: isDark ? darkTheme : lightTheme,
        isDark,
        toggleTheme,
        fontSize,
        setFontSize: updateFontSize,
        userId,
        setUserId: updateUserId,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
