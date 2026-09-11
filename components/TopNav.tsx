import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs/types';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CONTENT_MAX } from '../constants/layout';
import { colors, radius, typography } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import CartBadge from './CartBadge';
import Logo from './Logo';

/** Routes shown as text links; cart and profile get their own icon slots. */
const LINKS = ['index', 'search', 'vendors'];

/**
 * Desktop replacement for the bottom tab bar. Same routes and same navigation
 * state — only the presentation changes, so nothing about routing moves.
 */
export default function TopNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const { user } = useAuth();
  const activeRoute = state.routes[state.index]?.name;

  const go = (name: string) => {
    const route = state.routes.find((r) => r.name === name);
    if (route) navigation.navigate(route.name);
  };

  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <Pressable onPress={() => go('index')} style={styles.brand}>
          <Logo size={22} />
        </Pressable>

        <View style={styles.links}>
          {state.routes
            .filter((r) => LINKS.includes(r.name))
            .map((route) => {
              const isActive = activeRoute === route.name;
              const label = descriptors[route.key]?.options.title ?? route.name;
              return (
                <Pressable key={route.key} onPress={() => go(route.name)} style={styles.link}>
                  <Text style={[styles.linkLabel, isActive && styles.linkLabelActive]}>{label}</Text>
                  <View style={[styles.underline, isActive && styles.underlineActive]} />
                </Pressable>
              );
            })}
        </View>

        <View style={styles.actions}>
          {user && (
            <Pressable style={styles.iconBtn} onPress={() => router.push('/favorites')}>
              <Ionicons name="heart-outline" size={19} color={colors.ink} />
            </Pressable>
          )}
          {user && (
            <Pressable style={styles.iconBtn} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={19} color={colors.ink} />
            </Pressable>
          )}

          <Pressable style={styles.iconBtn} onPress={() => go('cart')}>
            <View>
              <Ionicons
                name={activeRoute === 'cart' ? 'cart' : 'cart-outline'}
                size={20}
                color={activeRoute === 'cart' ? colors.red : colors.ink}
              />
              <CartBadge />
            </View>
          </Pressable>

          {user ? (
            <Pressable onPress={() => go('profile')}>
              <Image
                source={{ uri: user.avatar }}
                style={[styles.avatar, activeRoute === 'profile' && styles.avatarActive]}
                contentFit="cover"
              />
            </Pressable>
          ) : (
            <Pressable style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginBtnLabel}>Se connecter</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Full-bleed bar with a centred inner row, the way a site header behaves.
  bar: {
    backgroundColor: colors.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  inner: {
    width: '100%',
    maxWidth: CONTENT_MAX,
    alignSelf: 'center',
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 28,
  },
  brand: { justifyContent: 'center' },
  links: { flexDirection: 'row', alignItems: 'center', gap: 26, flex: 1 },
  link: { alignItems: 'center', gap: 5 },
  linkLabel: {
    fontFamily: typography.bodySemibold.fontFamily,
    fontSize: 14,
    color: colors.inkSoft,
  },
  linkLabelActive: { color: colors.red },
  underline: { height: 2, width: 18, borderRadius: 2, backgroundColor: 'transparent' },
  underlineActive: { backgroundColor: colors.red },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'transparent' },
  avatarActive: { borderColor: colors.red },
  loginBtn: {
    backgroundColor: colors.red,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    height: 40,
    justifyContent: 'center',
  },
  loginBtnLabel: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 13,
    color: colors.white,
  },
});
