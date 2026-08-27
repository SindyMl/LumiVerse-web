import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../components/ThemeContext';
import { api } from '../components/ApiService';

export default function StudySessionScreen() {
  const { theme, fontSize } = useTheme();
  const router = useRouter();
  const [verse, setVerse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [promptIndex, setPromptIndex] = useState(0);
  const prompts = ['Take a deep breath. Let the words settle in your heart.', 'Read slowly and notice the phrase that stays with you.', 'What might this verse be inviting you to practice today?'];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadVerse();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const loadVerse = async () => {
    try {
      const v = await api.getDailyVerse();
      setVerse(v);
      Animated.timing(fadeAnim, { toValue: 1, duration: 1500, useNativeDriver: true }).start();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const nextVerse = async () => {
    setPromptIndex((index) => (index + 1) % prompts.length);
    fadeAnim.setValue(0);
    setLoading(true);
    await loadVerse();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.dark ? '#02040A' : '#F5F2E9' }]} testID="study-session-screen">
      {/* Close button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} testID="study-close-btn">
          <Ionicons name="close" size={28} color={theme.foreground} />
        </TouchableOpacity>
        <View style={styles.timerRow}>
          <TouchableOpacity onPress={() => setIsRunning(!isRunning)} testID="study-timer-toggle">
            <Ionicons name={isRunning ? 'pause' : 'play'} size={20} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.timer, { color: theme.primary }]}>{formatTime(timer)}</Text>
        </View>
        <TouchableOpacity onPress={nextVerse} testID="study-next-btn">
          <Ionicons name="refresh" size={24} color={theme.foreground} />
        </TouchableOpacity>
      </View>

      {/* Verse Display */}
      <ScrollView contentContainerStyle={styles.verseContainer} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} />
        ) : verse ? (
          <Animated.View style={[styles.verseCard, { opacity: fadeAnim }]}>
            <View style={[styles.glowBorder, { borderColor: theme.primary + '40' }]}>
              <Text style={[styles.verseText, { color: theme.foreground, fontSize: fontSize + 6 }]}>
                {`"${verse.text}"`}
              </Text>
              <View style={styles.refRow}>
                <View style={[styles.refBadge, { backgroundColor: theme.primary + '20' }]}>
                  <Text style={[styles.refText, { color: theme.primary }]}>
                    {verse.book_name} {verse.chapter}:{verse.verse_number}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        ) : (
          <Text style={[styles.errorText, { color: theme.textMuted }]}>Could not load verse</Text>
        )}
      </ScrollView>

      {/* Lumi Moment */}
      <View style={[styles.lumiMoment, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="sparkles" size={16} color={theme.primary} />
        <Text style={[styles.lumiText, { color: theme.textMuted }]}>
          {prompts[promptIndex]}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timer: { fontSize: 20, fontWeight: '700', fontVariant: ['tabular-nums'] },
  verseContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  verseCard: { alignItems: 'center' },
  glowBorder: {
    borderWidth: 1, borderRadius: 24, padding: 32,
  },
  verseText: {
    textAlign: 'center', lineHeight: 40, fontStyle: 'italic', fontWeight: '300',
  },
  refRow: { alignItems: 'center', marginTop: 24 },
  refBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  refText: { fontSize: 14, fontWeight: '700' },
  errorText: { fontSize: 16, textAlign: 'center' },
  lumiMoment: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20,
    marginBottom: 20, padding: 14, borderRadius: 14, borderWidth: 1,
  },
  lumiText: { fontSize: 13, flex: 1, fontStyle: 'italic' },
});
