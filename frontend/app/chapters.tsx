import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../components/ThemeContext';

export default function ChaptersScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { book, name, chapters, color } = useLocalSearchParams<{
    book: string; name: string; chapters: string; color: string;
  }>();
  const chapterCount = parseInt(chapters || '1', 10);
  const sectionColor = color ? decodeURIComponent(color) : theme.primary;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} testID="chapters-screen">
      <View style={[styles.headerRow, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} testID="chapters-back-btn">
          <Ionicons name="arrow-back" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.foreground }]} numberOfLines={1}>
          {name ? decodeURIComponent(name) : 'Chapters'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {Array.from({ length: chapterCount }, (_, i) => i + 1).map((ch) => (
          <TouchableOpacity
            key={ch}
            testID={`chapter-btn-${ch}`}
            activeOpacity={0.7}
            onPress={() => router.push(`/reader?book=${book}&chapter=${ch}&name=${encodeURIComponent(name || '')}&color=${encodeURIComponent(sectionColor)}`)}
            style={[styles.chapterBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Text style={[styles.chapterNum, { color: theme.foreground }]}>{ch}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5,
  },
  title: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 10,
    justifyContent: 'flex-start',
  },
  chapterBtn: {
    width: 56, height: 56, borderRadius: 12, justifyContent: 'center',
    alignItems: 'center', borderWidth: 1,
  },
  chapterNum: { fontSize: 18, fontWeight: '600' },
});
