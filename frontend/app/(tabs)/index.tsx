import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, SECTION_COLORS } from '../../components/ThemeContext';
import { api } from '../../components/ApiService';

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [glowAnim] = useState(new Animated.Value(0.3));

  useEffect(() => {
    loadData();
    startGlow();
  }, []);

  const startGlow = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  };

  const loadData = async () => {
    try {
      const [verse, secs] = await Promise.all([api.getDailyVerse(), api.getSections()]);
      setDailyVerse(verse);
      setSections(secs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} testID="home-screen">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.logo, { color: theme.primary }]}>LumiVerse</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>Illuminated Study</Text>
        </View>

        {/* Daily Verse */}
        {dailyVerse && (
          <TouchableOpacity
            testID="daily-verse-card"
            activeOpacity={0.8}
            onPress={() => router.push(`/reader?book=${dailyVerse.book_abbrev}&chapter=${dailyVerse.chapter}`)}
          >
            <View style={[styles.verseCard, { backgroundColor: theme.surface, borderColor: theme.primary + '40' }]}>
              <Animated.View style={[styles.glowOverlay, { opacity: glowAnim, backgroundColor: theme.goldGlow }]} />
              <View style={styles.verseLabel}>
                <Ionicons name="sparkles" size={14} color={theme.primary} />
                <Text style={[styles.verseLabelText, { color: theme.primary }]}>Verse of the Day</Text>
              </View>
              <Text style={[styles.verseText, { color: theme.foreground }]}>
                {`"${dailyVerse.text}"`}
              </Text>
              <Text style={[styles.verseRef, { color: theme.textMuted }]}>
                — {dailyVerse.book_name} {dailyVerse.chapter}:{dailyVerse.verse_number}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            testID="my-paths-btn"
            style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push('/paths')}
          >
            <Ionicons name="map-outline" size={24} color={theme.accent} />
            <Text style={[styles.actionText, { color: theme.foreground }]}>My Paths</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="sections-btn"
            style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push('/sections')}
          >
            <Ionicons name="library-outline" size={24} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.foreground }]}>Sections</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="search-btn"
            style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push('/search')}
          >
            <Ionicons name="search-outline" size={24} color={theme.accent} />
            <Text style={[styles.actionText, { color: theme.foreground }]}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="study-btn"
            style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push('/study-session')}
          >
            <Ionicons name="flame-outline" size={24} color="#FF6347" />
            <Text style={[styles.actionText, { color: theme.foreground }]}>Study</Text>
          </TouchableOpacity>
        </View>

        {/* Sections Preview */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Bible Sections</Text>
          <TouchableOpacity onPress={() => router.push('/sections')} testID="see-all-sections-btn">
            <Text style={[styles.seeAll, { color: theme.accent }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {sections.slice(0, 4).map((sec) => {
          const sColor = SECTION_COLORS[sec.id] || { color: '#333', accent: '#FFF' };
          return (
            <TouchableOpacity
              key={sec.id}
              testID={`section-card-${sec.id}`}
              activeOpacity={0.7}
              onPress={() => router.push(`/section-books?sectionId=${sec.id}&name=${encodeURIComponent(sec.name)}&color=${encodeURIComponent(sColor.color)}`)}
              style={[styles.sectionCard, { backgroundColor: theme.surface, borderLeftColor: sColor.color }]}
            >
              <View style={styles.sectionCardContent}>
                <Text style={[styles.sectionName, { color: theme.foreground }]}>{sec.name}</Text>
                <Text style={[styles.sectionBooks, { color: theme.textMuted }]}>{sec.book_count} books</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  logo: { fontSize: 32, fontWeight: '800', letterSpacing: 1 },
  subtitle: { fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 },
  verseCard: {
    marginHorizontal: 16, marginTop: 16, padding: 24, borderRadius: 16,
    borderWidth: 1, overflow: 'hidden', position: 'relative',
  },
  glowOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16,
  },
  verseLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, zIndex: 1 },
  verseLabelText: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  verseText: { fontSize: 17, lineHeight: 28, fontStyle: 'italic', zIndex: 1 },
  verseRef: { fontSize: 13, marginTop: 12, fontWeight: '600', zIndex: 1 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 20, gap: 10 },
  actionBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 12,
    borderWidth: 1, gap: 6,
  },
  actionText: { fontSize: 12, fontWeight: '600' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginTop: 28, marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  seeAll: { fontSize: 14, fontWeight: '600' },
  sectionCard: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8,
    padding: 16, borderRadius: 12, borderLeftWidth: 4,
  },
  sectionCardContent: { flex: 1 },
  sectionName: { fontSize: 16, fontWeight: '600' },
  sectionBooks: { fontSize: 12, marginTop: 2 },
});
