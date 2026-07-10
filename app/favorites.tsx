import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../components/ProductCard';
import { colors, radius, shadow, typography } from '../constants/theme';
import { useFavorites } from '../context/FavoritesContext';
import { products } from '../data/mockData';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favoriteIds } = useFavorites();

  const favoriteProducts = products.filter((p) => favoriteIds.includes(p.id));

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  if (favoriteProducts.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={colors.ink} />
          </Pressable>
          <Text style={styles.headerTitle}>Mes favoris</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="heart-outline" size={48} color={colors.lineStrong} />
          </View>
          <Text style={styles.emptyTitle}>Aucun favori pour le moment</Text>
          <Text style={styles.emptyText}>
            Appuyez sur le cœur d'un article pour l'enregistrer ici.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Mes favoris</Text>
        <Text style={styles.headerCount}>{favoriteProducts.length}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      >
        {favoriteProducts.map((p) => (
          <View key={p.id} style={styles.gridItem}>
            <ProductCard product={p} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: typography.display.fontFamily,
    fontSize: 20,
    color: colors.ink,
  },
  headerCount: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 13,
    color: colors.inkFaint,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 28,
  },
  gridItem: { width: '47%' },

  // Empty
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  emptyTitle: {
    fontFamily: typography.displaySemibold.fontFamily,
    fontSize: 20,
    color: colors.ink,
    marginTop: 18,
  },
  emptyText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
