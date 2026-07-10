import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../constants/theme';

export default function RatingBadge({
  rating,
  compact,
}: {
  rating: number;
  compact?: boolean;
}) {
  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <Ionicons name="star" size={compact ? 11 : 13} color={colors.gold} />
      <Text style={[styles.text, compact && styles.textCompact]}>{rating.toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 5,
    gap: 4,
  },
  compact: { paddingHorizontal: 7, paddingVertical: 3 },
  text: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 12.5,
    color: colors.ink,
  },
  textCompact: { fontSize: 11 },
});
