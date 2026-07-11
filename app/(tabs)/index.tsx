import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../components/Logo';
import ProductCard from '../../components/ProductCard';
import SectionHeader from '../../components/SectionHeader';
import VendorCard from '../../components/VendorCard';
import { colors, radius, shadow, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import {
  getFeaturedVendors,
  products,
  vendors,
} from '../../data/mockData';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const featured = useMemo(() => getFeaturedVendors(), []);
  const coupsDeCoeur = useMemo(() => products.filter((p) => p.tag === 'Coup de cœur'), []);
  const nearbyVendors = useMemo(() => vendors.slice(0, 3), []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        {/* Barre du haut */}
        <View style={styles.topBar}>
          <Logo size={24} />
          <View style={styles.rightActions}>
            {user && (
              <Pressable style={styles.iconBtn} onPress={() => router.push('/favorites')}>
                <Ionicons name="heart-outline" size={20} color={colors.ink} />
              </Pressable>
            )}
            {user && (
              <Pressable style={styles.iconBtn} onPress={() => router.push('/notifications')}>
                <Ionicons name="notifications-outline" size={20} color={colors.ink} />
                <View style={styles.bellDot} />
              </Pressable>
            )}
            {user ? (
              <Pressable onPress={() => router.push('/(tabs)/profile')}>
                <Image source={{ uri: user.avatar }} style={styles.avatar} contentFit="cover" />
              </Pressable>
            ) : (
              <Pressable style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
                <Ionicons name="person-outline" size={18} color={colors.ink} />
                <Text style={styles.loginBtnLabel}>Se connecter</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Recherche */}
        <Pressable style={styles.searchRow} onPress={() => router.push('/(tabs)/search')}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.inkFaint} />
            <Text style={styles.searchPlaceholder}>Rechercher une boutique, un article...</Text>
          </View>
        </Pressable>

        {/* Bannière */}
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroKicker}>CETTE SEMAINE</Text>
            <Text style={styles.heroTitle}>Seconde main,{'\n'}premier choix</Text>
            <Pressable style={styles.heroCta} onPress={() => router.push('/(tabs)/vendors')}>
              <Text style={styles.heroCtaText}>Découvrir les boutiques</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.red} />
            </Pressable>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600' }}
            style={styles.heroImage}
            contentFit="cover"
          />
        </View>

        {/* Boutiques à la une */}
        <View style={styles.section}>
          <SectionHeader
            title="Boutiques à la une"
            subtitle="Les préférées du quartier"
            actionLabel="Tout voir"
            onAction={() => router.push('/(tabs)/vendors')}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingRight: 4, paddingBottom: 8 }}>
            {featured.map((v) => (
              <View key={v.id} style={{ width: 250 }}>
                <VendorCard vendor={v} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Coups de cœur */}
        <View style={styles.section}>
          <SectionHeader title="Nos coups de cœur" subtitle="Des pièces qui partent vite" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 4, paddingBottom: 8 }}>
            {coupsDeCoeur.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ScrollView>
        </View>

        {/* Près de vous */}
        <View style={styles.section}>
          <SectionHeader
            title="Près de vous"
            subtitle={`${vendors.length} boutiques dans votre secteur`}
            actionLabel="Tout voir"
            onAction={() => router.push('/(tabs)/vendors')}
          />
          <View style={{ gap: 12 }}>
            {nearbyVendors.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  rightActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.paper,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    height: 42,
    ...shadow.soft,
  },
  loginBtnLabel: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 12.5,
    color: colors.ink,
  },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  bellDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.red,
    borderWidth: 1.5,
    borderColor: colors.paper,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 18,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 48,
    ...shadow.soft,
  },
  searchPlaceholder: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.inkFaint,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ink,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: radius.xl,
    padding: 20,
    overflow: 'hidden',
    ...shadow.card,
  },
  heroKicker: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 10.5,
    color: colors.red,
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontFamily: typography.display.fontFamily,
    fontSize: 23,
    color: colors.white,
    marginTop: 8,
    lineHeight: 28,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
  },
  heroCtaText: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 12.5,
    color: colors.red,
  },
  heroImage: {
    width: 96,
    height: 110,
    borderRadius: radius.lg,
    marginLeft: 10,
  },
  section: { marginTop: 28, marginBottom: 4, paddingHorizontal: 20 },
});
