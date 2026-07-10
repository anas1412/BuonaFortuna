import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, typography } from '../constants/theme';
import { Vendor } from '../data/mockData';
import RatingBadge from './RatingBadge';

export default function VendorRow({ vendor }: { vendor: Vendor }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/vendor/${vendor.id}`)}
      style={({ pressed }) => [
        styles.card,
        shadow.soft,
        pressed && { opacity: 0.92 },
      ]}
    >
      <Image source={{ uri: vendor.coverImage }} style={styles.image} contentFit="cover" />
      <View style={styles.body}>
        <View style={styles.rowBetween}>
          <Text style={styles.name} numberOfLines={1}>
            {vendor.name}
          </Text>
          <RatingBadge rating={vendor.rating} compact />
        </View>
        <Text style={styles.tagline} numberOfLines={2}>
          {vendor.tagline}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={12} color={colors.inkFaint} />
          <Text style={styles.metaText} numberOfLines={1}>
            {vendor.location}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: { width: 104, minHeight: 112, backgroundColor: colors.line },
  body: { flex: 1, padding: 12, gap: 4 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  name: {
    flex: 1,
    fontFamily: typography.displaySemibold.fontFamily,
    fontSize: 16,
    color: colors.ink,
  },
  tagline: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12.5,
    color: colors.inkSoft,
    lineHeight: 17,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText: { fontFamily: typography.bodyMedium.fontFamily, fontSize: 11, color: colors.inkFaint },
});
