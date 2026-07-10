import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import {
  getProductsByVendor,
  getReviewsByVendor,
  getVendorById,
} from '../../data/mockData';

const TABS = ['Articles', 'À propos', 'Avis'] as const;

export default function VendorShopScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Articles');
  const [following, setFollowing] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const vendor = getVendorById(id);

  if (!vendor) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundText}>Boutique introuvable.</Text>
      </SafeAreaView>
    );
  }

  const shopProducts = getProductsByVendor(vendor.id);
  const shopReviews = getReviewsByVendor(vendor.id);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.coverWrap}>
          <Image source={{ uri: vendor.coverImage }} style={styles.cover} contentFit="cover" />
          <View style={styles.coverShade} />
          <SafeAreaView edges={['top']} style={styles.coverNav}>
            <Pressable style={styles.navBtn} onPress={goBack}>
              <Ionicons name="chevron-back" size={22} color={colors.white} />
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable style={styles.navBtn}>
                <Ionicons name="heart-outline" size={19} color={colors.white} />
              </Pressable>
              <Pressable
                style={styles.navBtn}
                onPress={() => Alert.alert('Partager', `Partager ${vendor.name} avec vos amis.`)}
              >
                <Ionicons name="share-outline" size={19} color={colors.white} />
              </Pressable>
            </View>
          </SafeAreaView>

        </View>

        <View style={styles.infoCard}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{vendor.name}</Text>
              <Text style={styles.tagline}>{vendor.tagline}</Text>
            </View>
            <Image source={{ uri: vendor.logoImage }} style={styles.logo} contentFit="cover" />
          </View>

          <View style={styles.metaRow}>
            <RatingBadge rating={vendor.rating} />
            <Text style={styles.reviewCount}>({vendor.reviewCount} avis)</Text>
          </View>

          <View style={styles.quickInfoRow}>
            <View style={styles.quickInfoItem}>
              <Ionicons name="time-outline" size={16} color={colors.red} />
              <Text style={styles.quickInfoText}>{vendor.deliveryTime}</Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Ionicons name="location-outline" size={16} color={colors.red} />
              <Text style={styles.quickInfoText} numberOfLines={1}>
                {vendor.location}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              style={[styles.followBtn, following && styles.followBtnActive]}
              onPress={() => setFollowing((f) => !f)}
            >
              <Ionicons
                name={following ? 'checkmark' : 'add'}
                size={16}
                color={following ? colors.white : colors.red}
              />
              <Text style={[styles.followBtnText, following && styles.followBtnTextActive]}>
                {following ? 'Suivi(e)' : 'Suivre la boutique'}
              </Text>
            </Pressable>
            <Pressable style={styles.messageBtn}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.ink} />
            </Pressable>
            <Pressable style={styles.callBtn}>
              <Ionicons name="call-outline" size={18} color={colors.ink} />
            </Pressable>
          </View>
        </View>

        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <Pressable key={t} style={styles.tabItem} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
              {tab === t && <View style={styles.tabUnderline} />}
            </Pressable>
          ))}
        </View>

        {tab === 'Articles' && (
          <View style={styles.grid}>
            {shopProducts.map((p) => (
              <View key={p.id} style={styles.gridItem}>
                <ProductCard product={p} />
              </View>
            ))}
            {shopProducts.length === 0 && (
              <Text style={styles.emptyText}>Aucun article pour le moment.</Text>
            )}
          </View>
        )}

        {tab === 'À propos' && (
          <View style={styles.aboutWrap}>
            <Text style={styles.aboutText}>{vendor.description}</Text>
            <View style={styles.aboutRow}>
              <Ionicons name="location-outline" size={16} color={colors.red} />
              <Text style={styles.aboutRowText}>{vendor.location}</Text>
            </View>
            <View style={styles.aboutRow}>
              <Ionicons name="time-outline" size={16} color={colors.red} />
              <Text style={styles.aboutRowText}>Délai habituel : {vendor.deliveryTime}</Text>
            </View>
          </View>
        )}

        {tab === 'Avis' && (
          <View style={styles.reviewsWrap}>
            <View style={styles.reviewSummary}>
              <Text style={styles.reviewScore}>{vendor.rating.toFixed(1)}</Text>
              <View>
                <View style={{ flexDirection: 'row', gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons
                      key={i}
                      name={i <= Math.round(vendor.rating) ? 'star' : 'star-outline'}
                      size={14}
                      color={colors.gold}
                    />
                  ))}
                </View>
                <Text style={styles.reviewCountText}>{vendor.reviewCount} notes</Text>
              </View>
            </View>
            {shopReviews.map((r) => (
              <ReviewItem key={r.id} name={r.userName} text={r.text} rating={r.rating} />
            ))}
            {shopReviews.length === 0 && (
              <Text style={styles.emptyText}>Aucun avis pour le moment.</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ReviewItem({ name, text, rating }: { name: string; text: string; rating: number }) {
  return (
    <View style={styles.reviewItem}>
      <View style={styles.rowBetween}>
        <Text style={styles.reviewName}>{name}</Text>
        <View style={{ flexDirection: 'row', gap: 1 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Ionicons key={i} name={i <= rating ? 'star' : 'star-outline'} size={11} color={colors.gold} />
          ))}
        </View>
      </View>
      <Text style={styles.reviewText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
  notFoundText: { fontFamily: typography.bodySemibold.fontFamily, fontSize: 15, color: colors.ink },
  coverWrap: { height: 260, backgroundColor: colors.line },
  cover: { width: '100%', height: '100%' },
  coverShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    backgroundColor: colors.overlay,
  },
  coverNav: {
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
  infoCard: {
    backgroundColor: colors.paper,
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: radius.xl,
    padding: 18,
    ...shadow.card,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  name: { fontFamily: typography.display.fontFamily, fontSize: 22, color: colors.ink },
  tagline: { fontFamily: typography.body.fontFamily, fontSize: 13, color: colors.inkSoft, marginTop: 4 },
  logo: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    marginLeft: 12,
    borderWidth: 2,
    borderColor: colors.paper,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  reviewCount: { fontFamily: typography.bodyMedium.fontFamily, fontSize: 12, color: colors.inkFaint },
  metaDivider: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.lineStrong, marginHorizontal: 2 },
  metaText: { fontFamily: typography.bodyMedium.fontFamily, fontSize: 12, color: colors.inkFaint },
  quickInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.redSofter,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 14,
  },
  quickInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  quickInfoText: { fontFamily: typography.bodySemibold.fontFamily, fontSize: 11.5, color: colors.ink },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  followBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.red,
    borderRadius: radius.pill,
    paddingVertical: 12,
  },
  followBtnActive: { backgroundColor: colors.red },
  followBtnText: { fontFamily: typography.bodyBold.fontFamily, fontSize: 13.5, color: colors.red },
  followBtnTextActive: { color: colors.white },
  messageBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.redSofter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.redSofter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 26,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  tabItem: { paddingBottom: 12 },
  tabText: { fontFamily: typography.bodySemibold.fontFamily, fontSize: 14, color: colors.inkFaint },
  tabTextActive: { color: colors.ink },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.red,
    borderRadius: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 12,
  },
  gridItem: { width: '47%' },
  emptyText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.inkFaint,
    paddingHorizontal: 20,
  },
  aboutWrap: { padding: 20, gap: 16 },
  aboutText: { fontFamily: typography.body.fontFamily, fontSize: 14.5, color: colors.inkSoft, lineHeight: 22 },
  aboutRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aboutRowText: { fontFamily: typography.bodyMedium.fontFamily, fontSize: 13.5, color: colors.ink },
  reviewsWrap: { padding: 20, gap: 16 },
  reviewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: 16,
    ...shadow.soft,
  },
  reviewScore: { fontFamily: typography.display.fontFamily, fontSize: 34, color: colors.ink },
  reviewCountText: { fontFamily: typography.body.fontFamily, fontSize: 12, color: colors.inkFaint, marginTop: 4 },
  reviewItem: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    padding: 14,
    gap: 6,
    ...shadow.soft,
  },
  reviewName: { fontFamily: typography.bodyBold.fontFamily, fontSize: 13.5, color: colors.ink },
  reviewText: { fontFamily: typography.body.fontFamily, fontSize: 13, color: colors.inkSoft, lineHeight: 19 },
});
