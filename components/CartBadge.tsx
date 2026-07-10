import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../constants/theme';
import { useCart } from '../context/CartContext';

export default function CartBadge() {
  const { totalItems } = useCart();

  if (totalItems === 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{totalItems > 99 ? '99+' : totalItems}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -8,
    backgroundColor: colors.red,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  text: {
    color: colors.white,
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 10,
  },
});
