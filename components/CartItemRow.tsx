import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, typography } from '../constants/theme';
import { useCart, CartItem } from '../context/CartContext';

export default function CartItemRow({ item }: { item: CartItem }) {
  const { removeItem, updateQuantity } = useCart();

  return (
    <View style={styles.row}>
      <Image source={{ uri: item.product.images[0] }} style={styles.image} contentFit="cover" />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.brand}>{item.product.brand}</Text>
            <Text style={styles.name} numberOfLines={1}>{item.product.name}</Text>
          </View>
          <Pressable onPress={() => removeItem(item.product.id)} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={colors.inkFaint} />
          </Pressable>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.price}>{item.product.price.toFixed(0)} €</Text>
          <View style={styles.stepper}>
            <Pressable
              style={styles.stepBtn}
              onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
            >
              <Ionicons name="remove" size={16} color={colors.ink} />
            </Pressable>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <Pressable
              style={styles.stepBtn}
              onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color={colors.ink} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: 12,
    ...shadow.soft,
  },
  image: { width: 100, height: 100, backgroundColor: colors.line },
  body: { flex: 1, padding: 12, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  brand: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 11,
    color: colors.red,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  name: {
    fontFamily: typography.bodySemibold.fontFamily,
    fontSize: 14,
    color: colors.ink,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  price: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 16,
    color: colors.ink,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.cream,
    borderRadius: radius.pill,
    paddingHorizontal: 4,
  },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 14,
    color: colors.ink,
    minWidth: 16,
    textAlign: 'center',
  },
});
