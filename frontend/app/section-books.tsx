import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../components/ThemeContext';
import { api } from '../components/ApiService';

export default function SectionBooksScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { sectionId, name, color } = useLocalSearchParams<{ sectionId: string; name: string; color: string }>();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionColor = color ? decodeURIComponent(color) : theme.primary;

  useEffect(() => {
    if (sectionId) {
      api.getBooks(sectionId).then(setBooks).catch(console.error).finally(() => setLoading(false));
    }
  }, [sectionId]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} testID="section-books-screen">
      <View style={[styles.headerRow, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} testID="section-books-back-btn">
          <Ionicons name="arrow-back" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.sectionDot, { backgroundColor: sectionColor }]} />
          <Text style={[styles.title, { color: theme.foreground }]} numberOfLines={1}>
            {name ? decodeURIComponent(name) : 'Books'}
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item.abbrev}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            testID={`book-card-${item.abbrev}`}
            activeOpacity={0.7}
            onPress={() => router.push(`/chapters?book=${item.abbrev}&name=${encodeURIComponent(item.name)}&chapters=${item.chapter_count}&color=${encodeURIComponent(sectionColor)}`)}
            style={[styles.bookCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <View style={[styles.bookIcon, { backgroundColor: sectionColor + '20' }]}>
              <Ionicons name="book" size={18} color={sectionColor} />
            </View>
            <View style={styles.bookInfo}>
              <Text style={[styles.bookName, { color: theme.foreground }]}>{item.name}</Text>
              <Text style={[styles.chapterCount, { color: theme.textMuted }]}>{item.chapter_count} chapters</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5,
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginLeft: 12 },
  sectionDot: { width: 10, height: 10, borderRadius: 5 },
  title: { fontSize: 18, fontWeight: '700' },
  bookCard: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12,
    borderWidth: 1, marginBottom: 8,
  },
  bookIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  bookInfo: { flex: 1, marginLeft: 12 },
  bookName: { fontSize: 16, fontWeight: '600' },
  chapterCount: { fontSize: 12, marginTop: 2 },
});
