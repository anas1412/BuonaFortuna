import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VendorRow from '../../components/VendorRow';
import { colors, radius, shadow, typography } from '../../constants/theme';
import { vendors } from '../../data/mockData';

const SORTS = [
  { key: 'recommended', label: 'Recommandé' },
  { key: 'rating', label: 'Mieux notés' },
  { key: 'distance', label: 'Plus proche' },
] as const;

type SortKey = (typeof SORTS)[number]['key'];

export default function VendorsScreen() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('recommended');

  const filtered = useMemo(() => {
    let list = [...vendors];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (v) => v.name.toLowerCase().includes(q) || v.tagline.toLowerCase().includes(q),
      );
    }
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [query, sort]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <FlatList
          data={filtered}
          keyExtractor={(v) => v.id}
          renderItem={({ item }) => <VendorRow vendor={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Boutiques</Text>
              </View>

              {/* Search */}
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={colors.inkFaint} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Rechercher une boutique..."
                  placeholderTextColor={colors.inkFaint}
                  style={styles.searchInput}
                  returnKeyType="search"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
                {!!query && (
                  <Pressable onPress={() => setQuery('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color={colors.inkFaint} />
                  </Pressable>
                )}
              </View>

              {/* Sort tabs */}
              <View style={styles.sortRow}>
                {SORTS.map((s) => {
                  const active = sort === s.key;
                  return (
                    <Pressable
                      key={s.key}
                      style={styles.sortTab}
                      onPress={() => setSort(s.key)}
                    >
                      <Text style={[styles.sortTabText, active && styles.sortTabTextActive]}>
                        {s.label}
                      </Text>
                      {active && <View style={styles.sortUnderline} />}
                    </Pressable>
                  );
                })}
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="storefront-outline" size={36} color={colors.lineStrong} />
              <Text style={styles.emptyTitle}>Aucune boutique trouvée</Text>
              <Text style={styles.emptyText}>Essayez un autre mot-clé ou un autre filtre.</Text>
            </View>
          }
        />
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  header: { paddingTop: 8, paddingBottom: 4 },
  title: { fontFamily: typography.display.fontFamily, fontSize: 26, color: colors.ink },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 48,
    marginTop: 16,
    ...shadow.soft,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.ink,
  },

  // Sort tabs
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  sortTab: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  sortTabText: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: colors.inkFaint,
  },
  sortTabTextActive: {
    fontFamily: typography.bodyBold.fontFamily,
    color: colors.ink,
  },
  sortUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: colors.red,
    borderRadius: 1.5,
  },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60, gap: 6 },
  emptyTitle: { fontFamily: typography.bodyBold.fontFamily, fontSize: 15, color: colors.ink, marginTop: 8 },
  emptyText: { fontFamily: typography.body.fontFamily, fontSize: 13, color: colors.inkFaint },
});
