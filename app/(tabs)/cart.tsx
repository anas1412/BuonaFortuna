import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CartItemRow from '../../components/CartItemRow';
import { colors, radius, shadow, typography } from '../../constants/theme';
import { useCart } from '../../context/CartContext';

export default function CartScreen() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Panier</Text>
        </View>
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="cart-outline" size={48} color={colors.lineStrong} />
          </View>
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptyText}>
            Parcourez nos boutiques et ajoutez des articles à votre panier.
          </Text>
          <Pressable style={styles.browseBtn} onPress={() => router.push('/(tabs)/vendors')}>
            <Text style={styles.browseBtnText}>Découvrir les boutiques</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Panier</Text>
        <Pressable onPress={clearCart} hitSlop={8}>
          <Text style={styles.clearText}>Vider</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 160 }}
      >
        {items.map((item) => (
          <CartItemRow key={item.product.id} item={item} />
        ))}
      </ScrollView>

      {/* Sticky summary */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sous-total</Text>
          <Text style={styles.summaryValue}>{totalPrice.toFixed(0)} €</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Livraison estimée</Text>
          <Text style={styles.summaryValue}>2–5 jours</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{totalPrice.toFixed(0)} €</Text>
        </View>
        <Pressable
          style={styles.checkoutBtn}
          onPress={() => {
            clearCart();
            router.push('/(tabs)/profile');
          }}
        >
          <Text style={styles.checkoutBtnText}>Passer la commande</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: { fontFamily: typography.display.fontFamily, fontSize: 28, color: colors.ink },
  clearText: {
    fontFamily: typography.bodySemibold.fontFamily,
    fontSize: 13.5,
    color: '#C23A2E',
  },

  // Empty
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  emptyTitle: {
    fontFamily: typography.displaySemibold.fontFamily,
    fontSize: 20,
    color: colors.ink,
    marginTop: 18,
  },
  emptyText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  browseBtn: {
    marginTop: 24,
    backgroundColor: colors.red,
    borderRadius: radius.pill,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  browseBtnText: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 14.5,
    color: colors.white,
  },

  // Summary bar
  summaryBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13.5,
    color: colors.inkSoft,
  },
  summaryValue: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 13.5,
    color: colors.ink,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 8,
  },
  totalLabel: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 16,
    color: colors.ink,
  },
  totalValue: {
    fontFamily: typography.display.fontFamily,
    fontSize: 20,
    color: colors.red,
  },
  checkoutBtn: {
    backgroundColor: colors.red,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 14,
    ...shadow.floating,
  },
  checkoutBtnText: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 15.5,
    color: colors.white,
  },
});
