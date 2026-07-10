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
import { categories, vendors } from '../../data/mockData';

const SORTS = [
  { key: 'recommended', label: 'Recommandé' },
  { key: 'rating', label: 'Mieux notés' },
  { key: 'distance', label: 'Plus proche' },
] as const;

type SortKey = (typeof SORTS)[number]['key'];

export default function VendorsScreen() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('recommended');
  const [openOnly, setOpenOnly] = useState(true);

  const filtered = useMemo(() => {
    let list = vendors.filter((v) => v.isOpen);
    if (activeCategory) list = list.filter((v) => v.categoryId === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (v) => v.name.toLowerCase().includes(q) || v.tagline.toLowerCase().includes(q),
      );
    }
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [activeCategory, openOnly, query, sort]);

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

              {/* Search + Ouvert toggle */}
              <View style={styles.searchRow}>
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
                <Pressable
                  style={[styles.openToggle, openOnly && styles.openToggleActive]}
                  onPress={() => setOpenOnly((o) => !o)}
                >
                  <Ionicons
                    name={openOnly ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={openOnly ? colors.white : colors.inkSoft}
                  />
                </Pressable>
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

              {/* Category chips */}
              <View style={styles.categoryRow}>
                <Pressable
                  style={[styles.catChip, !activeCategory && styles.catChipActive]}
                  onPress={() => setActiveCategory(null)}
                >
                  <Ionicons
                    name="grid-outline"
                    size={13}
                    color={!activeCategory ? colors.white : colors.red}
                  />
                  <Text style={[styles.catChipText, !activeCategory && styles.catChipTextActive]}>
                    Toutes
                  </Text>
                </Pressable>
                {categories.map((item) => {
                  const active = activeCategory === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      style={[styles.catChip, active && styles.catChipActive]}
                      onPress={() => setActiveCategory(active ? null : item.id)}
                    >
                      <Ionicons name={item.icon as any} size={13} color={active ? colors.white : colors.red} />
                      <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                        {item.name}
                      </Text>
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

  // Search + open toggle
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 44,
    ...shadow.soft,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.ink,
  },
  openToggle: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openToggleActive: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },

  // Sort tabs (text-based, not pills)
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

  // Category chips
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.paper,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    height: 32,
    borderWidth: 1,
    borderColor: colors.line,
  },
  catChipActive: { backgroundColor: colors.red, borderColor: colors.red },
  catChipText: { fontFamily: typography.bodySemibold.fontFamily, fontSize: 12, color: colors.ink },
  catChipTextActive: { color: colors.white },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60, gap: 6 },
  emptyTitle: { fontFamily: typography.bodyBold.fontFamily, fontSize: 15, color: colors.ink, marginTop: 8 },
  emptyText: { fontFamily: typography.body.fontFamily, fontSize: 13, color: colors.inkFaint },
});
