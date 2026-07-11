import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../components/ProductCard';
import RatingBadge from '../../components/RatingBadge';
import { colors, radius, shadow, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import {
  getProductsByVendor,
  getProductById,
  getVendorById,
} from '../../data/mockData';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addItem } = useCart();
  const { user } = useAuth();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const product = getProductById(id);

  if (!product) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundText}>Article introuvable.</Text>
      </SafeAreaView>
    );
  }

  const vendor = getVendorById(product.vendorId);
  const relatedProducts = getProductsByVendor(product.vendorId).filter(
    (p) => p.id !== product.id,
  );

  const favorited = isFavorite(product.id);

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  const requireAuth = (action: string, callback: () => void) => {
    if (!user) {
      Alert.alert(
        'Connexion requise',
        `Connectez-vous pour ${action}.`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/(auth)/login') },
        ],
      );
      return;
    }
    callback();
  };

  const handleToggleFavorite = () => {
    const result = toggleFavorite(product.id);
    if (!result) {
      requireAuth('ajouter des favoris', () => {});
    }
  };

  const handleAddToCart = () => {
    const result = addItem(product);
    if (!result) {
      requireAuth('ajouter au panier', () => {});
    } else {
      Alert.alert('Ajouté au panier', `${product.name} a été ajouté à votre panier.`);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero image */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: product.image }} style={styles.heroImage} contentFit="cover" />
          <View style={styles.heroShade} />
          <SafeAreaView edges={['top']} style={styles.heroNav}>
            <Pressable style={styles.navBtn} onPress={goBack}>
              <Ionicons name="chevron-back" size={22} color={colors.white} />
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                style={styles.navBtn}
                onPress={handleToggleFavorite}
              >
                <Ionicons
                  name={favorited ? 'heart' : 'heart-outline'}
                  size={19}
                  color={favorited ? colors.red : colors.white}
                />
              </Pressable>
              <Pressable
                style={styles.navBtn}
                onPress={() => Alert.alert('Partager', `Partager ${product.name} avec vos amis.`)}
              >
                <Ionicons name="share-outline" size={19} color={colors.white} />
              </Pressable>
            </View>
          </SafeAreaView>

          {/* Condition badge on image */}
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{product.condition}</Text>
          </View>

          {/* Tag badge */}
          {!!product.tag && (
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>{product.tag}</Text>
            </View>
          )}
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.brand}>{product.brand}</Text>
              <Text style={styles.name}>{product.name}</Text>
            </View>
            {discount !== null && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discount}%</Text>
              </View>
            )}
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{product.price.toFixed(0)} €</Text>
            {!!product.compareAtPrice && (
              <Text style={styles.compareAt}>{product.compareAtPrice.toFixed(0)} €</Text>
            )}
          </View>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="resize-outline" size={14} color={colors.inkFaint} />
              <Text style={styles.metaText}>Taille {product.size}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="ribbon-outline" size={14} color={colors.inkFaint} />
              <Text style={styles.metaText}>{product.condition}</Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <RatingBadge rating={product.rating} />
          </View>
        </View>

        {/* Vendor mini-card */}
        {!!vendor && (
          <Pressable
            style={styles.vendorCard}
            onPress={() => router.push(`/vendor/${vendor.id}`)}
          >
            <Image source={{ uri: vendor.logoImage }} style={styles.vendorLogo} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text style={styles.vendorName}>{vendor.name}</Text>
              <Text style={styles.vendorMeta}>
                {vendor.reviewCount} avis · {vendor.rating.toFixed(1)} ★
              </Text>
              <View style={styles.vendorStatusRow}>
                <Text style={styles.vendorDelivery}>{vendor.deliveryTime}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
          </Pressable>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Autres articles de la même boutique</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingRight: 4 }}
            >
              {relatedProducts.map((p) => (
                <View key={p.id} style={{ width: 168 }}>
                  <ProductCard product={p} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Sticky bottom bar */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.favoriteBtn}
          onPress={handleToggleFavorite}
        >
          <Ionicons
            name={favorited ? 'heart' : 'heart-outline'}
            size={22}
            color={favorited ? colors.red : colors.red}
          />
        </Pressable>
        <Pressable
          style={styles.contactBtn}
          onPress={handleAddToCart}
        >
          <Ionicons name="cart-outline" size={18} color={colors.white} />
          <Text style={styles.contactBtnText}>Ajouter au panier</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
  notFoundText: { fontFamily: typography.bodySemibold.fontFamily, fontSize: 15, color: colors.ink },

  // Hero
  heroWrap: { height: 340, backgroundColor: colors.line },
  heroImage: { width: '100%', height: '100%' },
  heroShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    backgroundColor: colors.overlay,
  },
  heroNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(26,21,18,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionBadge: {
    position: 'absolute',
    bottom: 44,
    left: 16,
    backgroundColor: 'rgba(255,252,249,0.92)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  conditionText: {
    color: colors.ink,
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 11.5,
  },
  tagBadge: {
    position: 'absolute',
    bottom: 44,
    right: 16,
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    color: colors.white,
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 11.5,
    letterSpacing: 0.3,
  },

  // Info card
  infoCard: {
    backgroundColor: colors.paper,
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: radius.xl,
    padding: 18,
    ...shadow.card,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  brand: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 12.5,
    color: colors.red,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  name: {
    fontFamily: typography.display.fontFamily,
    fontSize: 22,
    color: colors.ink,
    marginTop: 4,
  },
  discountBadge: {
    backgroundColor: colors.redSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 12,
  },
  discountText: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 13,
    color: colors.red,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 14,
  },
  price: {
    fontFamily: typography.display.fontFamily,
    fontSize: 28,
    color: colors.red,
  },
  compareAt: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 16,
    color: colors.inkFaint,
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: colors.inkSoft,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.lineStrong,
  },
  ratingRow: { marginTop: 14 },

  // Vendor mini-card
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.paper,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: radius.lg,
    padding: 14,
    ...shadow.soft,
  },
  vendorLogo: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.line,
  },
  vendorName: {
    fontFamily: typography.displaySemibold.fontFamily,
    fontSize: 15,
    color: colors.ink,
  },
  vendorMeta: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 2,
  },
  vendorStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  vendorDelivery: {
    fontFamily: typography.body.fontFamily,
    fontSize: 11.5,
    color: colors.inkFaint,
  },

  // Description
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 13,
    color: colors.inkFaint,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  description: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14.5,
    color: colors.inkSoft,
    lineHeight: 22,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.paper,
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  favoriteBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.redSofter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.red,
    borderRadius: radius.pill,
    paddingVertical: 16,
    ...shadow.floating,
  },
  contactBtnText: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 15,
    color: colors.white,
  },
});
