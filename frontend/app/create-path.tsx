import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, SECTION_COLORS } from '../components/ThemeContext';
import { api } from '../components/ApiService';

export default function CreatePathScreen() {
  const { theme, userId } = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [books, setBooks] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getBooks().then(setBooks).catch(console.error).finally(() => setLoading(false));
  }, []);

  const toggleBook = (book: any) => {
    const exists = selectedItems.find((i) => i.book_abbrev === book.abbrev);
    if (exists) {
      setSelectedItems((prev) => prev.filter((i) => i.book_abbrev !== book.abbrev));
    } else {
      // Add chapter 1 of book
      setSelectedItems((prev) => [...prev, {
        book_abbrev: book.abbrev,
        book_name: book.name,
        chapter_number: 1,
        section_id: book.section_id,
      }]);
    }
  };

  const savePath = async () => {
    if (!name.trim() || !userId) return;
    setSaving(true);
    try {
      await api.createPath({
        user_id: userId,
        name: name.trim(),
        description: description.trim(),
        items: selectedItems,
      });
      router.back();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} testID="create-path-screen">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} testID="create-path-back-btn">
            <Ionicons name="close" size={24} color={theme.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.foreground }]}>New Path</Text>
          <TouchableOpacity
            testID="save-path-btn"
            onPress={savePath}
            disabled={saving || !name.trim()}
            style={{ opacity: name.trim() ? 1 : 0.4 }}
          >
            {saving ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Text style={[styles.saveText, { color: theme.primary }]}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.inputSection}>
            <TextInput
              testID="path-name-input"
              style={[styles.input, { color: theme.foreground, borderColor: theme.border, backgroundColor: theme.surface }]}
              placeholder="Path name (e.g., 'Wisdom Journey')"
              placeholderTextColor={theme.textMuted}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              testID="path-desc-input"
              style={[styles.input, styles.descInput, { color: theme.foreground, borderColor: theme.border, backgroundColor: theme.surface }]}
              placeholder="Description (optional)"
              placeholderTextColor={theme.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          <View style={styles.booksSection}>
            <Text style={[styles.sectionLabel, { color: theme.foreground }]}>
              Select Books ({selectedItems.length} selected)
            </Text>
            {loading ? (
              <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
            ) : (
              books.map((book) => {
                const isSelected = selectedItems.some((i) => i.book_abbrev === book.abbrev);
                const sc = SECTION_COLORS[book.section_id] || { color: '#333' };
                return (
                  <TouchableOpacity
                    key={book.abbrev}
                    testID={`path-book-${book.abbrev}`}
                    onPress={() => toggleBook(book)}
                    style={[
                      styles.bookRow,
                      { backgroundColor: theme.surface, borderColor: isSelected ? sc.color : theme.border },
                      isSelected && { borderWidth: 2 },
                    ]}
                  >
                    <View style={[styles.checkCircle, { borderColor: sc.color }, isSelected && { backgroundColor: sc.color }]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color="#FFF" />}
                    </View>
                    <Text style={[styles.bookName, { color: theme.foreground }]}>{book.name}</Text>
                    <Text style={[styles.bookChapters, { color: theme.textMuted }]}>{book.chapter_count} ch</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  title: { fontSize: 18, fontWeight: '700' },
  saveText: { fontSize: 16, fontWeight: '700' },
  inputSection: { paddingHorizontal: 16, marginTop: 8 },
  input: {
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 15, marginBottom: 10,
  },
  descInput: { height: 70, textAlignVertical: 'top' },
  booksSection: { paddingHorizontal: 16, marginTop: 16 },
  sectionLabel: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  bookRow: {
    flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10,
    borderWidth: 1, marginBottom: 6, gap: 10,
  },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  bookName: { flex: 1, fontSize: 15, fontWeight: '500' },
  bookChapters: { fontSize: 12 },
});
