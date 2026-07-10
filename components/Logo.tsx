import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../constants/theme';

/**
 * BuonaFortuna wordmark — "Buona" in ink, "Fortuna" in coccinelle red.
 * `size` maps to the font size so every call site (auth screens, home
 * header, profile) can keep using the same prop it already had.
 */
export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.text, { fontSize: size }]}>
        <Text style={styles.buona}>Buona</Text>
        <Text style={styles.fortuna}>Fortuna</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center' },
  text: {
    fontFamily: typography.display.fontFamily,
    letterSpacing: -0.3,
  },
  buona: { color: colors.ink },
  fortuna: { color: colors.red },
});
