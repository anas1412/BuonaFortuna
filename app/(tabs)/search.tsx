import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../components/ProductCard';
import VendorRow from '../../components/VendorRow';
import { colors, radius, shadow, typography } from '../../constants/theme';
import { useSearch } from '../../context/SearchContext';
import { categories, products, vendors } from '../../data/mockData';

const SORTS = [
  { key: 'recommended', label: 'Recommandé' },
  { key: 'rating', label: 'Mieux notés' },
  { key: 'distance', label: 'Plus proche' },
] as const;

type SortKey = (typeof SORTS)[number]['key'];

export default function SearchScreen() {
  const { query, setQuery, clearSearch } = useSearch();
  const [sort, setSort] = useState<SortKey>('recommended');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredVendors = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return vendors.filter(
      (v) => v.name.toLowerCase().includes(q) || v.tagline.toLowerCase().includes(q),
    );
  }, [query]);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.condition.toLowerCase().includes(q),
    );
  }, [query]);

  const hasQuery = query.trim().length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Recherche</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.inkFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher une boutique, un article..."
          placeholderTextColor={colors.inkFaint}
          style={styles.searchInput}
          autoFocus
        />
        {!!query && (
          <Pressable onPress={clearSearch} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.inkFaint} />
          </Pressable>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        {!hasQuery && (
          <>
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
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={[{ id: null, name: 'Toutes', icon: 'grid-outline' }, ...categories]}
              keyExtractor={(c) => c.id ?? 'all'}
              contentContainerStyle={styles.chipRow}
              renderItem={({ item }) => {
                const active = item.id === null ? !activeCategory : activeCategory === item.id;
                return (
                  <Pressable
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => {
                      if (item.id === null) setActiveCategory(null);
                      else setActiveCategory(active ? null : item.id);
                    }}
                  >
                    <Ionicons name={item.icon as any} size={14} color={active ? colors.white : colors.red} />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {item.name}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </>
        )}

        {hasQuery && filteredVendors.length === 0 && filteredProducts.length === 0 && (
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={36} color={colors.lineStrong} />
            <Text style={styles.emptyTitle}>Aucun résultat</Text>
            <Text style={styles.emptyText}>Essayez un autre mot-clé.</Text>
          </View>
        )}

        {filteredVendors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Boutiques ({filteredVendors.length})</Text>
            {filteredVendors.map((v) => (
              <VendorRow key={v.id} vendor={v} />
            ))}
          </View>
        )}

        {filteredProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Articles ({filteredProducts.length})</Text>
            <View style={styles.productGrid}>
              {filteredProducts.map((p) => (
                <View key={p.id} style={styles.productGridItem}>
                  <ProductCard product={p} />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { paddingHorizontal: 20, paddingTop: 8 },
  title: { fontFamily: typography.display.fontFamily, fontSize: 28, color: colors.ink },
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
  searchInput: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.ink,
  },

  // Suggestions
  suggestionsWrap: { marginTop: 16 },

  // Sort tabs
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 16,
    marginHorizontal: 20,
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
  chipRow: { marginHorizontal: 20, paddingVertical: 14, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.paper,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    height: 34,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: { backgroundColor: colors.red, borderColor: colors.red },
  chipText: {
    fontFamily: typography.bodySemibold.fontFamily,
    fontSize: 12.5,
    color: colors.ink,
  },
  chipTextActive: { color: colors.white },

  // Results
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 13,
    color: colors.inkFaint,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productGridItem: { width: '47%' },

  // Empty
  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 6 },
  emptyTitle: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 15,
    color: colors.ink,
    marginTop: 8,
  },
  emptyText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.inkFaint,
  },
});
