import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CartBadge from '../../components/CartBadge';
import { colors, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

/** Tab button that suppresses all press feedback (ripple / highlight). */
function NoFeedback({ children, onPress, onLongPress, ...rest }: any) {
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} {...rest}>
      {children}
    </Pressable>
  );
}

// Fixed height of the tab bar's actual content (icon + label),
// independent of the device's bottom safe-area inset.
const BAR_CONTENT_HEIGHT = 56;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.red,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: [
          styles.tabBar,
          {
            height: BAR_CONTENT_HEIGHT + insets.bottom,
            paddingBottom: insets.bottom,
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarIconStyle: styles.tabIconStyle,
        tabBarButton: NoFeedback,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Recherche',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'search' : 'search-outline'} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="vendors"
        options={{
          title: 'Boutiques',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'storefront' : 'storefront-outline'} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Panier',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <TabIcon name={focused ? 'cart' : 'cart-outline'} color={color as string} />
              <CartBadge />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: user ? 'Profil' : 'Se connecter',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person-circle' : 'person-circle-outline'} color={color as string} />
          ),
          href: user ? undefined : '/(auth)/login',
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name, color }: { name: keyof typeof Ionicons.glyphMap; color: string }) {
  return (
    <View style={styles.iconWrap}>
      <Ionicons name={name} size={23} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 0,
  },
  // Each tab item gets the full fixed content height and centers its
  // icon + label together, so icon and text line up identically on
  // every platform regardless of the bottom inset added around them.
  tabItem: {
    height: BAR_CONTENT_HEIGHT,
    paddingTop: 8,
    paddingBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconStyle: {
    marginBottom: 2,
  },
  iconWrap: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: typography.bodySemibold.fontFamily,
    fontSize: 10.5,
    lineHeight: 13,
    marginTop: 0,
  },
});
