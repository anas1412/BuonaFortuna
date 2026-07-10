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
  { key: 'recommended', label: 'Recommandé', icon: 'flame-outline' as const },
  { key: 'rating', label: 'Mieux notés', icon: 'star-outline' as const },
  { key: 'distance', label: 'Plus proche', icon: 'navigate-outline' as const },
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

              {/* Sort chips */}
              <View style={styles.filterRow}>
                {SORTS.map((s) => {
                  const active = sort === s.key;
                  return (
                    <Pressable
                      key={s.key}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setSort(s.key)}
                    >
                      <Ionicons name={s.icon} size={13} color={active ? colors.white : colors.red} />
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {s.label}
                      </Text>
                    </Pressable>
                  );
                })}

                <View style={styles.chipDivider} />

                <Pressable
                  style={[styles.chip, openOnly && styles.chipActive]}
                  onPress={() => setOpenOnly((o) => !o)}
                >
                  <Ionicons
                    name={openOnly ? 'checkmark-circle' : 'ellipse-outline'}
                    size={13}
                    color={openOnly ? colors.white : colors.ink}
                  />
                  <Text style={[styles.chipText, openOnly && styles.chipTextActive]}>
                    Ouvert
                  </Text>
                </Pressable>
              </View>

              {/* Category chips */}
              <View style={styles.categoryRow}>
                <Pressable
                  style={[styles.catChip, !activeCategory && styles.catChipActive]}
                  onPress={() => setActiveCategory(null)}
                >
                  <Ionicons
                    name="grid-outline"
                    size={14}
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
                      <Ionicons name={item.icon as any} size={14} color={active ? colors.white : colors.red} />
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 48,
    marginTop: 10,
    ...shadow.soft,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.ink,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    fontFamily: typography.bodySemibold.fontFamily,
    fontSize: 12,
    color: colors.ink,
  },
  chipTextActive: {
    color: colors.white,
  },
  chipDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.lineStrong,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.paper,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    height: 32,
    borderWidth: 1,
    borderColor: colors.line,
  },
  catChipActive: { backgroundColor: colors.red, borderColor: colors.red },
  catChipText: { fontFamily: typography.bodySemibold.fontFamily, fontSize: 12, color: colors.ink },
  catChipTextActive: { color: colors.white },
  empty: { alignItems: 'center', paddingTop: 60, gap: 6 },
  emptyTitle: { fontFamily: typography.bodyBold.fontFamily, fontSize: 15, color: colors.ink, marginTop: 8 },
  emptyText: { fontFamily: typography.body.fontFamily, fontSize: 13, color: colors.inkFaint },
});
