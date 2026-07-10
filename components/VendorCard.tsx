import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, typography } from '../constants/theme';
import { Vendor } from '../data/mockData';
import RatingBadge from './RatingBadge';

export default function VendorCard({ vendor }: { vendor: Vendor }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/vendor/${vendor.id}`)}
      style={({ pressed }) => [
        styles.card,
        shadow.card,
        pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
      ]}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: vendor.coverImage }} style={styles.image} contentFit="cover" />
        <View style={styles.ratingPos}>
          <RatingBadge rating={vendor.rating} compact />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.rowBetween}>
          <Text style={styles.name} numberOfLines={1}>
            {vendor.name}
          </Text>
          {vendor.featured && (
            <View style={styles.featuredDot}>
              <Ionicons name="sparkles" size={11} color={colors.red} />
            </View>
          )}
        </View>
        <Text style={styles.tagline} numberOfLines={1}>
          {vendor.tagline}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={colors.inkFaint} />
            <Text style={styles.metaText}>{vendor.deliveryTime}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color={colors.inkFaint} />
            <Text style={styles.metaText} numberOfLines={1}>{vendor.location}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    overflow: 'hidden',
    width: '100%',
  },
  imageWrap: { width: '100%', height: 140, backgroundColor: colors.line },
  image: { width: '100%', height: '100%' },
  ratingPos: { position: 'absolute', top: 10, left: 10 },
  body: { padding: 14 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: {
    flex: 1,
    fontFamily: typography.displaySemibold.fontFamily,
    fontSize: 16.5,
    color: colors.ink,
  },
  featuredDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.redSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  tagline: {
    marginTop: 3,
    fontFamily: typography.body.fontFamily,
    fontSize: 12.5,
    color: colors.inkSoft,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 11.5,
    color: colors.inkFaint,
  },
  metaDivider: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.lineStrong },
});
