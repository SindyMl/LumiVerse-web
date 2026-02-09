import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../components/ThemeContext';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme, fontSize, setFontSize } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} testID="settings-screen">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.foreground }]}>Settings</Text>
        </View>

        {/* Theme Toggle */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={theme.primary} />
              <Text style={[styles.label, { color: theme.foreground }]}>Dark Mode</Text>
            </View>
            <Switch
              testID="dark-mode-toggle"
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#D4C5A9', true: theme.primary + '60' }}
              thumbColor={isDark ? theme.primary : '#F5F2E9'}
            />
          </View>
        </View>

        {/* Font Size */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.rowLeft}>
            <Ionicons name="text" size={22} color={theme.primary} />
            <Text style={[styles.label, { color: theme.foreground }]}>Font Size: {fontSize}px</Text>
          </View>
          <View style={styles.sliderRow}>
            <Text style={[styles.sliderLabel, { color: theme.textMuted }]}>A</Text>
            <View style={styles.sliderWrap}>
              <TouchableOpacity
                testID="font-decrease-btn"
                onPress={() => fontSize > 12 && setFontSize(fontSize - 1)}
                style={[styles.sliderBtn, { backgroundColor: theme.backgroundSecondary }]}
              >
                <Ionicons name="remove" size={18} color={theme.foreground} />
              </TouchableOpacity>
              <View style={[styles.sliderFill, { flex: (fontSize - 12) / 12, backgroundColor: theme.primary }]} />
              <View style={[styles.sliderFill, { flex: 1 - (fontSize - 12) / 12, backgroundColor: theme.border }]} />
              <TouchableOpacity
                testID="font-increase-btn"
                onPress={() => fontSize < 24 && setFontSize(fontSize + 1)}
                style={[styles.sliderBtn, { backgroundColor: theme.backgroundSecondary }]}
              >
                <Ionicons name="add" size={18} color={theme.foreground} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.sliderLabelLg, { color: theme.textMuted }]}>A</Text>
          </View>
          <Text style={[styles.preview, { color: theme.foreground, fontSize }]}>
            Preview text at {fontSize}px
          </Text>
        </View>

        {/* About */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.rowLeft}>
            <Ionicons name="information-circle-outline" size={22} color={theme.primary} />
            <Text style={[styles.label, { color: theme.foreground }]}>About LumiVerse</Text>
          </View>
          <Text style={[styles.about, { color: theme.textMuted }]}>
            A personalized Bible study app with illuminated verses. KJV Bible text in public domain. 
            Built with love for focused, beautiful Bible study.
          </Text>
          <Text style={[styles.version, { color: theme.textMuted }]}>Version 1.0.0</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '800' },
  card: {
    marginHorizontal: 16, marginTop: 12, padding: 20, borderRadius: 14,
    borderWidth: 1,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { fontSize: 16, fontWeight: '600' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8 },
  sliderLabel: { fontSize: 12, fontWeight: '600' },
  sliderLabelLg: { fontSize: 20, fontWeight: '600' },
  sliderWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 32, borderRadius: 16, overflow: 'hidden' },
  sliderBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  sliderFill: { height: 4 },
  preview: { marginTop: 12, fontStyle: 'italic' },
  about: { fontSize: 14, lineHeight: 20, marginTop: 10 },
  version: { fontSize: 12, marginTop: 8 },
});
