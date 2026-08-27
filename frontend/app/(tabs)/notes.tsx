import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, HIGHLIGHT_COLORS } from '../../components/ThemeContext';
import { api } from '../../components/ApiService';

export default function NotesScreen() {
  const { theme, userId } = useTheme();
  const [notes, setNotes] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'notes' | 'highlights'>('notes');
  const [editing, setEditing] = useState<any>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    if (!userId) return;
    try {
      const [n, h] = await Promise.all([api.getNotes(userId), api.getHighlights(userId)]);
      setNotes(n);
      setHighlights(h);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!editing || !editText.trim()) return;
    const updated = await api.updateNote(editing.id, { text: editText.trim(), tags: editing.tags || [] });
    setNotes((prev) => prev.map((note) => note.id === editing.id ? { ...note, text: updated.text || editText.trim() } : note));
    setEditing(null);
  };

  const deleteNote = async (id: string) => {
    try {
      await api.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {}
  };

  const deleteHighlight = async (id: string) => {
    try {
      await api.deleteHighlight(id);
      setHighlights((prev) => prev.filter((h) => h.id !== id));
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} testID="notes-screen">
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.foreground }]}>Notes & Highlights</Text>
      </View>

      {/* Tab Switch */}
      <View style={[styles.tabRow, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          testID="notes-tab-btn"
          onPress={() => setTab('notes')}
          style={[styles.tabBtn, tab === 'notes' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
        >
          <Text style={[styles.tabText, { color: tab === 'notes' ? theme.primary : theme.textMuted }]}>
            Notes ({notes.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="highlights-tab-btn"
          onPress={() => setTab('highlights')}
          style={[styles.tabBtn, tab === 'highlights' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
        >
          <Text style={[styles.tabText, { color: tab === 'highlights' ? theme.primary : theme.textMuted }]}>
            Highlights ({highlights.length})
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'notes' ? (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No notes yet. Long-press a verse to add one.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.noteCard, { backgroundColor: theme.surface, borderColor: theme.border }]} testID={`note-card-${item.id}`}>
              <View style={styles.noteHeader}>
                <Text style={[styles.noteRef, { color: theme.accent }]}>
                  {item.book_name} {item.chapter_number}:{item.verse_number}
                </Text>
                <View style={{ flexDirection: 'row', gap: 14 }}><TouchableOpacity onPress={() => { setEditing(item); setEditText(item.text); }} testID={`edit-note-${item.id}`}><Ionicons name="create-outline" size={18} color={theme.accent} /></TouchableOpacity><TouchableOpacity onPress={() => deleteNote(item.id)} testID={`delete-note-${item.id}`}><Ionicons name="trash-outline" size={18} color="#FF6347" /></TouchableOpacity></View>
              </View>
              <Text style={[styles.noteText, { color: theme.foreground }]}>{item.text}</Text>
              {item.tags?.length > 0 && (
                <View style={styles.tagRow}>
                  {item.tags.map((tag: string, i: number) => (
                    <View key={i} style={[styles.tag, { backgroundColor: theme.primary + '20' }]}>
                      <Text style={[styles.tagText, { color: theme.primary }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        />
      ) : (
        <FlatList
          data={highlights}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="color-palette-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No highlights yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.highlightCard, { backgroundColor: theme.surface, borderColor: theme.border, borderLeftColor: item.color }]} testID={`highlight-card-${item.id}`}>
              <View style={styles.noteHeader}>
                <Text style={[styles.noteRef, { color: theme.accent }]}>
                  {item.book_name} {item.chapter_number}:{item.verse_number}
                </Text>
                <TouchableOpacity onPress={() => deleteHighlight(item.id)} testID={`delete-highlight-${item.id}`}>
                  <Ionicons name="trash-outline" size={18} color="#FF6347" />
                </TouchableOpacity>
              </View>
              <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            </View>
          )}
        />
      )}
      <Modal visible={!!editing} transparent animationType="slide"><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}><View style={[styles.editor, { backgroundColor: theme.surface }]}><View style={styles.noteHeader}><Text style={[styles.modalTitle, { color: theme.foreground }]}>Edit Note</Text><TouchableOpacity onPress={() => setEditing(null)}><Ionicons name="close" size={24} color={theme.textMuted} /></TouchableOpacity></View><TextInput testID="edit-note-input" value={editText} onChangeText={setEditText} multiline style={[styles.editInput, { color: theme.foreground, borderColor: theme.border }]} /><TouchableOpacity testID="save-edit-note-btn" onPress={saveEdit} style={[styles.saveBtn, { backgroundColor: theme.primary }]}><Text style={{ color: theme.primaryForeground, fontWeight: '700' }}>Save Changes</Text></TouchableOpacity></View></KeyboardAvoidingView></Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '800' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, marginHorizontal: 16 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { fontSize: 14, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  noteCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  noteRef: { fontSize: 13, fontWeight: '700' },
  noteText: { fontSize: 15, lineHeight: 22 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { fontSize: 11, fontWeight: '600' },
  highlightCard: { padding: 16, borderRadius: 12, borderWidth: 1, borderLeftWidth: 4, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 16, height: 16, borderRadius: 8 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  editor: { width: '90%', padding: 20, borderRadius: 18 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  editInput: { minHeight: 120, borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15, textAlignVertical: 'top' },
  saveBtn: { marginTop: 14, padding: 14, borderRadius: 24, alignItems: 'center' },
});
