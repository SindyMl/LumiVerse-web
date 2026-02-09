import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, SECTION_COLORS } from '../components/ThemeContext';
import { api } from '../components/ApiService';

export default function SectionsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.getSections().then(setSections).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} testID="sections-screen">
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} testID="sections-back-btn">
          <Ionicons name="arrow-back" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.foreground }]}>Bible Sections</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const sc = SECTION_COLORS[item.id] || { color: '#333', accent: '#FFF' };
          const isExpanded = expanded === item.id;
          return (
            <View style={{ marginBottom: 10 }}>
              <TouchableOpacity
                testID={`section-expand-${item.id}`}
                activeOpacity={0.7}
                onPress={() => setExpanded(isExpanded ? null : item.id)}
                style={[styles.card, { backgroundColor: theme.surface, borderLeftColor: sc.color }]}
              >
                <View style={styles.cardRow}>
                  <View style={styles.cardContent}>
                    <Text style={[styles.sectionName, { color: theme.foreground }]}>{item.name}</Text>
                    <Text style={[styles.bookCount, { color: theme.textMuted }]}>{item.book_count} books</Text>
                  </View>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={theme.textMuted} />
                </View>
              </TouchableOpacity>
              {isExpanded && (
                <View style={[styles.expandedContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.intro, { color: theme.textMuted }]}>{item.intro}</Text>
                  <TouchableOpacity
                    testID={`section-view-books-${item.id}`}
                    style={[styles.viewBooksBtn, { backgroundColor: sc.color }]}
                    onPress={() => router.push(`/section-books?sectionId=${item.id}&name=${encodeURIComponent(item.name)}&color=${encodeURIComponent(sc.color)}`)}
                  >
                    <Text style={styles.viewBooksText}>View Books</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  title: { fontSize: 20, fontWeight: '700' },
  card: {
    padding: 16, borderRadius: 12, borderLeftWidth: 4,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardContent: { flex: 1 },
  sectionName: { fontSize: 17, fontWeight: '700' },
  bookCount: { fontSize: 12, marginTop: 2 },
  expandedContent: {
    marginTop: -4, padding: 16, borderRadius: 0, borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12, borderWidth: 1, borderTopWidth: 0,
  },
  intro: { fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  viewBooksBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 12, paddingVertical: 10, borderRadius: 20,
  },
  viewBooksText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
