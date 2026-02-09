import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../components/ThemeContext';
import { api } from '../components/ApiService';

export default function PathsScreen() {
  const { theme, userId } = useTheme();
  const router = useRouter();
  const [paths, setPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaths();
  }, [userId]);

  const loadPaths = async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const data = await api.getPaths(userId);
      setPaths(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deletePath = async (id: string) => {
    try {
      await api.deletePath(id);
      setPaths((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} testID="paths-screen">
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} testID="paths-back-btn">
          <Ionicons name="arrow-back" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.foreground }]}>My Paths</Text>
        <TouchableOpacity onPress={() => router.push('/create-path')} testID="create-path-btn">
          <Ionicons name="add-circle" size={28} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={paths}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="map-outline" size={60} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.foreground }]}>No Paths Yet</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Create a custom reading path to study the Bible in your own order.
            </Text>
            <TouchableOpacity
              testID="create-first-path-btn"
              onPress={() => router.push('/create-path')}
              style={[styles.createBtn, { backgroundColor: theme.primary }]}
            >
              <Ionicons name="add" size={20} color={theme.primaryForeground} />
              <Text style={[styles.createBtnText, { color: theme.primaryForeground }]}>Create Path</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.pathCard, { backgroundColor: theme.surface, borderColor: theme.border }]} testID={`path-card-${item.id}`}>
            <View style={styles.pathHeader}>
              <View style={styles.pathInfo}>
                <Ionicons name="map" size={20} color={theme.primary} />
                <Text style={[styles.pathName, { color: theme.foreground }]}>{item.name}</Text>
              </View>
              <TouchableOpacity onPress={() => deletePath(item.id)} testID={`delete-path-${item.id}`}>
                <Ionicons name="trash-outline" size={18} color="#FF6347" />
              </TouchableOpacity>
            </View>
            {item.description ? (
              <Text style={[styles.pathDesc, { color: theme.textMuted }]}>{item.description}</Text>
            ) : null}
            <View style={styles.pathMeta}>
              <Text style={[styles.pathMetaText, { color: theme.textMuted }]}>
                {item.items?.length || 0} items
              </Text>
              <Text style={[styles.pathMetaText, { color: theme.textMuted }]}>
                Progress: {item.current_index || 0}/{item.items?.length || 0}
              </Text>
            </View>
            {item.items?.length > 0 && (
              <TouchableOpacity
                testID={`resume-path-${item.id}`}
                onPress={() => {
                  const currentItem = item.items[item.current_index || 0];
                  if (currentItem) {
                    router.push(`/reader?book=${currentItem.book_abbrev}&chapter=${currentItem.chapter_number}&name=${encodeURIComponent(currentItem.book_name || '')}&color=${encodeURIComponent(theme.primary)}`);
                  }
                }}
                style={[styles.resumeBtn, { borderColor: theme.primary }]}
              >
                <Ionicons name="play" size={16} color={theme.primary} />
                <Text style={[styles.resumeBtnText, { color: theme.primary }]}>Resume</Text>
              </TouchableOpacity>
            )}
          </View>
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
    paddingHorizontal: 16, paddingVertical: 12,
  },
  title: { fontSize: 20, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 8 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16,
    paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24,
  },
  createBtnText: { fontSize: 15, fontWeight: '700' },
  pathCard: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
  pathHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pathInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pathName: { fontSize: 17, fontWeight: '700' },
  pathDesc: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  pathMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  pathMetaText: { fontSize: 12 },
  resumeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 12, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5,
  },
  resumeBtnText: { fontSize: 14, fontWeight: '700' },
});
