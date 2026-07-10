import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadow, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, myVendor: vendor } = useAuth();

  useEffect(() => {
    if (!user) router.replace('/(auth)/login');
  }, [user]);

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
          <Pressable style={styles.iconBtn} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={20} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} contentFit="cover" />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.memberChip}>
            <Ionicons name="ribbon-outline" size={13} color={colors.red} />
            <Text style={styles.memberChipText}>Membre depuis {user.joinedDate}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Commandes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Favoris</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Avis</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ma boutique</Text>
          {vendor ? (
            <Pressable
              style={styles.shopCard}
              onPress={() => router.push(`/vendor/${vendor.id}`)}
            >
              <Image source={{ uri: vendor.logoImage }} style={styles.shopLogo} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.shopName}>{vendor.name}</Text>
                <Text style={styles.shopMeta}>
                  {vendor.reviewCount} avis · {vendor.rating.toFixed(1)} ★
                </Text>
                <View style={styles.manageChip}>
                  <Text style={styles.manageChipText}>Gérer ma boutique</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
            </Pressable>
          ) : (
            <View style={styles.createShopCard}>
              <View style={styles.createShopIcon}>
                <Ionicons name="storefront-outline" size={22} color={colors.red} />
              </View>
              <Text style={styles.createShopTitle}>Ouvrez votre propre boutique</Text>
              <Text style={styles.createShopText}>
                Chaque compte peut gérer une boutique. Commencez à vendre à la communauté
                BuonaFortuna en quelques minutes.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <MenuItem icon="heart-outline" label="Favoris enregistrés" onPress={() => router.push('/favorites')} />
          <MenuItem icon="notifications-outline" label="Notifications" onPress={() => router.push('/notifications')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconWrap}>
        <Ionicons name={icon} size={17} color={colors.ink} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.inkFaint} />
    </Pressable>
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
  },
  headerTitle: { fontFamily: typography.display.fontFamily, fontSize: 26, color: colors.ink },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  profileCard: { alignItems: 'center', marginTop: 22, paddingHorizontal: 20 },
  avatar: { width: 92, height: 92, borderRadius: 46, borderWidth: 3, borderColor: colors.paper, ...shadow.card },
  name: { fontFamily: typography.displaySemibold.fontFamily, fontSize: 20, color: colors.ink, marginTop: 14 },
  email: { fontFamily: typography.body.fontFamily, fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.redSofter,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 12,
  },
  memberChipText: { fontFamily: typography.bodySemibold.fontFamily, fontSize: 11.5, color: colors.red },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.paper,
    marginHorizontal: 20,
    marginTop: 22,
    borderRadius: radius.lg,
    paddingVertical: 16,
    ...shadow.soft,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: colors.line },
  statNumber: { fontFamily: typography.displaySemibold.fontFamily, fontSize: 19, color: colors.ink },
  statLabel: { fontFamily: typography.bodyMedium.fontFamily, fontSize: 11.5, color: colors.inkFaint, marginTop: 2 },
  section: { marginTop: 28, paddingHorizontal: 20 },
  sectionTitle: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 13,
    color: colors.inkFaint,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: 14,
    ...shadow.soft,
  },
  shopLogo: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.line },
  shopName: { fontFamily: typography.displaySemibold.fontFamily, fontSize: 16, color: colors.ink },
  shopMeta: { fontFamily: typography.body.fontFamily, fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  manageChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  manageChipText: { fontFamily: typography.bodyBold.fontFamily, fontSize: 10.5, color: colors.white },
  createShopCard: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.line,
    borderStyle: 'dashed',
  },
  createShopIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.redSofter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createShopTitle: { fontFamily: typography.displaySemibold.fontFamily, fontSize: 16, color: colors.ink, marginTop: 12 },
  createShopText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12.5,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 10,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.redSofter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontFamily: typography.bodySemibold.fontFamily, fontSize: 14, color: colors.ink },
});
