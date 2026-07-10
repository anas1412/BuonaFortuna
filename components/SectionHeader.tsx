import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../constants/theme';

export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {!!actionLabel && (
        <Pressable style={styles.action} onPress={onAction} hitSlop={8}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.red} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontFamily: typography.display.fontFamily,
    fontSize: 22,
    color: colors.ink,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.inkSoft,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingBottom: 3 },
  actionText: {
    fontFamily: typography.bodySemibold.fontFamily,
    fontSize: 13,
    color: colors.red,
  },
});
