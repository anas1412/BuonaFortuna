import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VendorRow from '../../components/VendorRow';
import { colors, radius, shadow, typography } from '../../constants/theme';
import { categories, vendors } from '../../data/mockData';

const SORTS = ['Recommandé', 'Mieux notés', 'Plus proche'] as const;

export default function VendorsScreen() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<(typeof SORTS)[number]>('Recommandé');
  const [openOnly, setOpenOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = vendors;
    if (activeCategory) list = list.filter((v) => v.categoryId === activeCategory);
    if (openOnly) list = list.filter((v) => v.isOpen);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (v) => v.name.toLowerCase().includes(q) || v.tagline.toLowerCase().includes(q)
      );
    }
    if (sort === 'Mieux notés') list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [activeCategory, openOnly, query, sort]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Boutiques</Text>
        <Text style={styles.subtitle}>{filtered.length} boutiques correspondent à vos filtres</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.inkFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher une boutique..."
          placeholderTextColor={colors.inkFaint}
          style={styles.searchInput}
        />
        {!!query && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.inkFaint} />
          </Pressable>
        )}
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.categoryList}
        ListHeaderComponent={
          <Pressable
            style={[styles.categoryChip, !activeCategory && styles.categoryChipActive]}
            onPress={() => setActiveCategory(null)}
          >
            <Text style={[styles.categoryChipText, !activeCategory && styles.categoryChipTextActive]}>
              Toutes
            </Text>
          </Pressable>
        }
        renderItem={({ item }) => {
          const active = activeCategory === item.id;
          return (
            <Pressable
              style={[styles.categoryChip, active && styles.categoryChipActive]}
              onPress={() => setActiveCategory(active ? null : item.id)}
            >
              <Ionicons name={item.icon as any} size={14} color={active ? colors.white : colors.red} />
              <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                {item.name}
              </Text>
            </Pressable>
          );
        }}
      />

      <View style={styles.toolbar}>
        <View style={styles.sortRow}>
          {SORTS.map((s) => (
            <Pressable key={s} onPress={() => setSort(s)} style={styles.sortItem}>
              <Text style={[styles.sortText, sort === s && styles.sortTextActive]}>{s}</Text>
              {sort === s && <View style={styles.sortUnderline} />}
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.openToggle} onPress={() => setOpenOnly((o) => !o)}>
          <View style={[styles.checkbox, openOnly && styles.checkboxActive]}>
            {openOnly && <Ionicons name="checkmark" size={12} color={colors.white} />}
          </View>
          <Text style={styles.openToggleText}>Ouvert maintenant</Text>
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(v) => v.id}
        renderItem={({ item }) => <VendorRow vendor={item} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="storefront-outline" size={36} color={colors.lineStrong} />
            <Text style={styles.emptyTitle}>Aucune boutique trouvée</Text>
            <Text style={styles.emptyText}>Essayez un autre mot-clé ou un autre filtre.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { paddingHorizontal: 20, paddingTop: 8 },
  title: { fontFamily: typography.display.fontFamily, fontSize: 28, color: colors.ink },
  subtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 48,
    marginHorizontal: 20,
    marginTop: 16,
    ...shadow.soft,
  },
  searchInput: { flex: 1, fontFamily: typography.body.fontFamily, fontSize: 14, color: colors.ink },
  categoryList: { paddingHorizontal: 20, gap: 10, paddingVertical: 16 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.paper,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.line,
    marginRight: 10,
  },
  categoryChipActive: { backgroundColor: colors.red, borderColor: colors.red },
  categoryChipText: { fontFamily: typography.bodySemibold.fontFamily, fontSize: 12.5, color: colors.ink },
  categoryChipTextActive: { color: colors.white },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sortRow: { flexDirection: 'row', gap: 16 },
  sortItem: { alignItems: 'center' },
  sortText: { fontFamily: typography.bodyMedium.fontFamily, fontSize: 12.5, color: colors.inkFaint },
  sortTextActive: { color: colors.ink, fontFamily: typography.bodyBold.fontFamily },
  sortUnderline: { height: 2, width: '100%', backgroundColor: colors.red, marginTop: 4, borderRadius: 1 },
  openToggle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: colors.red, borderColor: colors.red },
  openToggleText: { fontFamily: typography.bodyMedium.fontFamily, fontSize: 12.5, color: colors.inkSoft },
  empty: { alignItems: 'center', paddingTop: 60, gap: 6 },
  emptyTitle: { fontFamily: typography.bodyBold.fontFamily, fontSize: 15, color: colors.ink, marginTop: 8 },
  emptyText: { fontFamily: typography.body.fontFamily, fontSize: 13, color: colors.inkFaint },
});
