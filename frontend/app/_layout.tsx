import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../components/ThemeContext';
import { api } from '../components/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

function InitUser() {
  const { userId, setUserId } = useTheme();
  useEffect(() => {
    (async () => {
      if (!userId) {
        const stored = await AsyncStorage.getItem('userId');
        if (stored) {
          setUserId(stored);
        } else {
          try {
            const user = await api.createAnonymousUser();
            setUserId(user.id);
          } catch (e) { console.log('Init user error', e); }
        }
      }
    })();
  }, []);
  return null;
}

function RootNav() {
  const { theme, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <InitUser />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="sections" options={{ presentation: 'card' }} />
        <Stack.Screen name="section-books" options={{ presentation: 'card' }} />
        <Stack.Screen name="chapters" options={{ presentation: 'card' }} />
        <Stack.Screen name="reader" options={{ presentation: 'card' }} />
        <Stack.Screen name="paths" options={{ presentation: 'card' }} />
        <Stack.Screen name="create-path" options={{ presentation: 'modal' }} />
        <Stack.Screen name="study-session" options={{ presentation: 'fullScreenModal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNav />
    </ThemeProvider>
  );
}
