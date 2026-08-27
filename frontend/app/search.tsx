import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../components/ThemeContext';
import { api } from '../components/ApiService';

export default function SearchScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    const trimmed = query.trim();
    if (trimmed.length < 2 || trimmed.length > 100) { setError('Enter 2–100 characters to search.'); return; }
    setLoading(true); setSearched(true); setError('');
    try { setResults(await api.search(query.trim())); } catch { setResults([]); setError('Search is unavailable. Check your connection and try again.'); }
    finally { setLoading(false); }
  };
  return <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} testID="search-screen">
    <View style={[styles.header, { borderBottomColor: theme.border }]}>
      <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={theme.foreground} /></TouchableOpacity>
      <Text style={[styles.title, { color: theme.foreground }]}>Bible Search</Text><View style={{ width: 24 }} />
    </View>
    <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Ionicons name="search" size={20} color={theme.textMuted} />
      <TextInput testID="search-input" value={query} onChangeText={setQuery} onSubmitEditing={submit} returnKeyType="search" placeholder="Search verse content" placeholderTextColor={theme.textMuted} style={[styles.input, { color: theme.foreground }]} />
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Search Bible" testID="search-submit-btn" onPress={submit}><Ionicons name="arrow-forward-circle" size={24} color={theme.primary} /></TouchableOpacity>
    </View>
    {error ? <Text accessibilityRole="alert" style={[styles.empty, { color: theme.primary }]}>{error}</Text> : null}
    {loading ? <ActivityIndicator style={styles.loader} color={theme.primary} /> : <FlatList data={results} keyExtractor={(item, i) => item.id || `${item.book_abbrev}-${item.chapter_number}-${item.verse_number}-${i}`} contentContainerStyle={styles.list} ListEmptyComponent={searched ? <Text style={[styles.empty, { color: theme.textMuted }]}>No verses found. Try another phrase.</Text> : <Text style={[styles.empty, { color: theme.textMuted }]}>Search the full Bible by verse content.</Text>} renderItem={({ item }) => <TouchableOpacity testID={`search-result-${item.verse_number}`} onPress={() => router.push(`/reader?book=${encodeURIComponent(item.book_abbrev)}&chapter=${item.chapter_number}&name=${encodeURIComponent(item.book_name || '')}`)} style={[styles.result, { backgroundColor: theme.surface, borderColor: theme.border }]}><Text style={[styles.ref, { color: theme.primary }]}>{item.book_name} {item.chapter_number}:{item.verse_number}</Text><Text style={[styles.text, { color: theme.foreground }]}>{item.text}</Text></TouchableOpacity>} />}
  </SafeAreaView>;
}
const styles = StyleSheet.create({ container:{flex:1}, header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:16,borderBottomWidth:1}, title:{fontSize:20,fontWeight:'700'}, searchBox:{flexDirection:'row',alignItems:'center',gap:10,margin:16,paddingHorizontal:14,borderWidth:1,borderRadius:14}, input:{flex:1,height:50,fontSize:16}, loader:{marginTop:30}, list:{paddingHorizontal:16,paddingBottom:24}, result:{padding:16,borderRadius:14,borderWidth:1,marginBottom:10}, ref:{fontSize:13,fontWeight:'700',marginBottom:6}, text:{fontSize:15,lineHeight:23}, empty:{textAlign:'center',marginTop:50,fontSize:15,paddingHorizontal:30} });
