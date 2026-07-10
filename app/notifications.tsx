import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadow, typography } from '../constants/theme';
import { notifications, Notification } from '../data/notifications';

const TYPE_ICON: Record<Notification['type'], keyof typeof Ionicons.glyphMap> = {
  order: 'cube-outline',
  promo: 'pricetag-outline',
  vendor: 'storefront-outline',
  system: 'information-circle-outline',
};

const TYPE_COLOR: Record<Notification['type'], string> = {
  order: colors.green,
  promo: colors.red,
  vendor: colors.gold,
  system: colors.inkFaint,
};

export default function NotificationsScreen() {
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        {notifications.map((n) => (
          <View key={n.id} style={[styles.card, !n.read && styles.cardUnread]}>
            <View style={[styles.iconWrap, { backgroundColor: TYPE_COLOR[n.type] + '18' }]}>
              <Ionicons name={TYPE_ICON[n.type]} size={18} color={TYPE_COLOR[n.type]} />
            </View>
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1}>{n.title}</Text>
                {!n.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.text} numberOfLines={2}>{n.body}</Text>
              <Text style={styles.date}>{n.date}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
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
  headerTitle: {
    fontFamily: typography.display.fontFamily,
    fontSize: 20,
    color: colors.ink,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.paper,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: radius.lg,
    padding: 14,
    ...shadow.soft,
  },
  cardUnread: {
    backgroundColor: colors.redSofter,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 14,
    color: colors.ink,
    flex: 1,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
  text: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12.5,
    color: colors.inkSoft,
    lineHeight: 17,
  },
  date: {
    fontFamily: typography.body.fontFamily,
    fontSize: 11,
    color: colors.inkFaint,
    marginTop: 2,
  },
});
