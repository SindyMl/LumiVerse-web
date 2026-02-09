import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, HIGHLIGHT_COLORS } from '../components/ThemeContext';
import { api } from '../components/ApiService';

export default function ReaderScreen() {
  const { theme, fontSize, userId } = useTheme();
  const router = useRouter();
  const { book, chapter, name, color } = useLocalSearchParams<{
    book: string; chapter: string; name: string; color: string;
  }>();
  const [chapterData, setChapterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [highlights, setHighlights] = useState<Record<number, string>>({});
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const sectionColor = color ? decodeURIComponent(color) : theme.primary;
  const chapterNum = parseInt(chapter || '1', 10);

  useEffect(() => {
    loadChapter();
  }, [book, chapter]);

  const loadChapter = async () => {
    setLoading(true);
    try {
      const [ch, hl] = await Promise.all([
        api.getChapter(book!, chapterNum),
        userId ? api.getHighlights(userId) : Promise.resolve([]),
      ]);
      setChapterData(ch);
      const hlMap: Record<number, string> = {};
      hl.filter((h: any) => h.book_abbrev === book && h.chapter_number === chapterNum)
        .forEach((h: any) => { hlMap[h.verse_number] = h.color; });
      setHighlights(hlMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerseLongPress = (verseNum: number) => {
    setSelectedVerse(verseNum);
    setShowHighlightPicker(true);
  };

  const applyHighlight = async (clr: string) => {
    if (!selectedVerse || !userId) return;
    try {
      await api.createHighlight({
        user_id: userId, book_abbrev: book, chapter_number: chapterNum,
        verse_number: selectedVerse, color: clr,
      });
      setHighlights((prev) => ({ ...prev, [selectedVerse]: clr }));
    } catch {}
    setShowHighlightPicker(false);
  };

  const openNoteForVerse = () => {
    setShowHighlightPicker(false);
    setNoteText('');
    setShowNoteModal(true);
  };

  const saveNote = async () => {
    if (!selectedVerse || !userId || !noteText.trim()) return;
    try {
      await api.createNote({
        user_id: userId, book_abbrev: book, chapter_number: chapterNum,
        verse_number: selectedVerse, text: noteText.trim(), tags: [],
      });
    } catch {}
    setShowNoteModal(false);
    setNoteText('');
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} testID="reader-screen">
      {/* Header */}
      <View style={[styles.headerRow, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} testID="reader-back-btn">
          <Ionicons name="arrow-back" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.foreground }]}>
          {name ? decodeURIComponent(name) : ''} {chapter}
        </Text>
        <TouchableOpacity
          testID="reader-insight-btn"
          onPress={() => {
            // Placeholder AI Insight
            setSelectedVerse(null);
            setShowNoteModal(false);
          }}
        >
          <Ionicons name="sparkles-outline" size={22} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Verses */}
      <ScrollView contentContainerStyle={styles.versesContainer} showsVerticalScrollIndicator={false}>
        {chapterData?.verses?.map((verse: any) => {
          const hlColor = highlights[verse.number];
          return (
            <TouchableOpacity
              key={verse.number}
              testID={`verse-${verse.number}`}
              activeOpacity={0.7}
              onLongPress={() => handleVerseLongPress(verse.number)}
              onPress={() => setSelectedVerse(selectedVerse === verse.number ? null : verse.number)}
              style={[
                styles.verseRow,
                hlColor && { backgroundColor: hlColor + '20', borderLeftColor: hlColor, borderLeftWidth: 3 },
                selectedVerse === verse.number && { backgroundColor: theme.goldGlow },
              ]}
            >
              <Text style={[styles.verseNum, { color: sectionColor, fontSize: fontSize - 4 }]}>
                {verse.number}
              </Text>
              <Text style={[styles.verseText, { color: theme.foreground, fontSize }]}>
                {verse.text}
              </Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Chapter Navigation */}
      <View style={[styles.navBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TouchableOpacity
          testID="prev-chapter-btn"
          disabled={chapterNum <= 1}
          onPress={() => router.replace(`/reader?book=${book}&chapter=${chapterNum - 1}&name=${encodeURIComponent(name || '')}&color=${encodeURIComponent(sectionColor)}`)}
          style={[styles.navBtn, chapterNum <= 1 && { opacity: 0.3 }]}
        >
          <Ionicons name="chevron-back" size={20} color={theme.foreground} />
          <Text style={[styles.navBtnText, { color: theme.foreground }]}>Prev</Text>
        </TouchableOpacity>
        <Text style={[styles.navChapter, { color: theme.textMuted }]}>Ch. {chapter}</Text>
        <TouchableOpacity
          testID="next-chapter-btn"
          onPress={() => router.replace(`/reader?book=${book}&chapter=${chapterNum + 1}&name=${encodeURIComponent(name || '')}&color=${encodeURIComponent(sectionColor)}`)}
          style={styles.navBtn}
        >
          <Text style={[styles.navBtnText, { color: theme.foreground }]}>Next</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.foreground} />
        </TouchableOpacity>
      </View>

      {/* Highlight Picker Modal */}
      <Modal visible={showHighlightPicker} transparent animationType="fade" testID="highlight-picker-modal">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowHighlightPicker(false)}>
          <View style={[styles.pickerCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.pickerTitle, { color: theme.foreground }]}>Verse {selectedVerse}</Text>
            <Text style={[styles.pickerSub, { color: theme.textMuted }]}>Choose highlight color</Text>
            <View style={styles.colorRow}>
              {HIGHLIGHT_COLORS.map((clr) => (
                <TouchableOpacity
                  key={clr}
                  testID={`highlight-color-${clr}`}
                  onPress={() => applyHighlight(clr)}
                  style={[styles.colorBtn, { backgroundColor: clr }]}
                />
              ))}
            </View>
            <TouchableOpacity
              testID="add-note-btn"
              onPress={openNoteForVerse}
              style={[styles.noteBtn, { borderColor: theme.border }]}
            >
              <Ionicons name="create-outline" size={18} color={theme.accent} />
              <Text style={[styles.noteBtnText, { color: theme.accent }]}>Add Note</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Note Modal */}
      <Modal visible={showNoteModal} transparent animationType="slide" testID="note-modal">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.noteCard, { backgroundColor: theme.surface }]}>
            <View style={styles.noteHeader}>
              <Text style={[styles.pickerTitle, { color: theme.foreground }]}>
                Note for Verse {selectedVerse}
              </Text>
              <TouchableOpacity onPress={() => setShowNoteModal(false)} testID="close-note-modal">
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <TextInput
              testID="note-text-input"
              style={[styles.noteInput, { color: theme.foreground, borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}
              multiline
              placeholder="Write your reflection..."
              placeholderTextColor={theme.textMuted}
              value={noteText}
              onChangeText={setNoteText}
              autoFocus
            />
            <TouchableOpacity
              testID="save-note-btn"
              onPress={saveNote}
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={[styles.saveBtnText, { color: theme.primaryForeground }]}>Save Note</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  title: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  versesContainer: { padding: 16 },
  verseRow: {
    flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 8,
    borderRadius: 8, marginBottom: 2,
  },
  verseNum: { fontWeight: '800', marginRight: 8, marginTop: 2, minWidth: 24, textAlign: 'right' },
  verseText: { flex: 1, lineHeight: 28 },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 0.5,
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8 },
  navBtnText: { fontSize: 14, fontWeight: '600' },
  navChapter: { fontSize: 14, fontWeight: '500' },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerCard: {
    padding: 24, borderRadius: 20, width: '85%', alignItems: 'center',
  },
  pickerTitle: { fontSize: 18, fontWeight: '700' },
  pickerSub: { fontSize: 13, marginTop: 4, marginBottom: 16 },
  colorRow: { flexDirection: 'row', gap: 12 },
  colorBtn: { width: 36, height: 36, borderRadius: 18 },
  noteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20,
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1,
  },
  noteBtnText: { fontSize: 14, fontWeight: '600' },
  noteCard: {
    padding: 24, borderRadius: 20, width: '90%',
  },
  noteHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  noteInput: {
    height: 120, borderWidth: 1, borderRadius: 12, padding: 12,
    fontSize: 15, textAlignVertical: 'top',
  },
  saveBtn: {
    marginTop: 16, paddingVertical: 14, borderRadius: 24, alignItems: 'center',
  },
  saveBtnText: { fontSize: 16, fontWeight: '700' },
});
