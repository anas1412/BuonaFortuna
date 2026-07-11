import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, typography } from '../constants/theme';
import { useFavorites } from '../context/FavoritesContext';
import { Product } from '../data/mockData';

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(product.id);

  const handleToggleFavorite = () => {
    const result = toggleFavorite(product.id);
    if (!result) {
      Alert.alert(
        'Connexion requise',
        'Connectez-vous pour ajouter des articles à vos favoris.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/(auth)/login') },
        ],
      );
    }
  };

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      style={({ pressed }) => [styles.card, shadow.soft, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.images[0] }} style={styles.image} contentFit="cover" />
        {!!product.tag && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{product.tag}</Text>
          </View>
        )}
        <Pressable
          style={styles.heartBtn}
          onPress={(e) => {
            e.stopPropagation();
            handleToggleFavorite();
          }}
        >
          <Ionicons
            name={favorited ? 'heart' : 'heart-outline'}
            size={16}
            color={favorited ? colors.red : colors.white}
          />
        </Pressable>
        <View style={styles.conditionTag}>
          <Text style={styles.conditionTagText}>{product.condition}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {product.brand} · Taille {product.size}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{product.price.toFixed(0)} €</Text>
          {!!product.compareAtPrice && (
            <Text style={styles.compareAt}>{product.compareAtPrice.toFixed(0)} €</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  imageWrap: { width: '100%', height: 128, backgroundColor: colors.line },
  image: { width: '100%', height: '100%' },
  tag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    color: colors.white,
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 9.5,
    letterSpacing: 0.3,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(26,21,18,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255,252,249,0.92)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  conditionTagText: {
    color: colors.ink,
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 9,
    letterSpacing: 0.2,
  },
  body: { padding: 11, gap: 3 },
  name: {
    fontFamily: typography.bodySemibold.fontFamily,
    fontSize: 13.5,
    color: colors.ink,
  },
  meta: {
    fontFamily: typography.body.fontFamily,
    fontSize: 11.5,
    color: colors.inkFaint,
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
  price: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 15,
    color: colors.red,
  },
  compareAt: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 12,
    color: colors.inkFaint,
    textDecorationLine: 'line-through',
  },
});
