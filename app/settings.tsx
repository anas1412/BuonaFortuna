import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadow, typography } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const confirmLogout = () => {
    const doLogout = () => { logout(); router.replace('/(tabs)'); };
    if (Platform.OS === 'web') {
      if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) doLogout();
    } else {
      Alert.alert('Se déconnecter', 'Voulez-vous vraiment vous déconnecter ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se déconnecter', style: 'destructive', onPress: doLogout },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <SettingsItem icon="person-outline" label="Modifier le profil" />
          <SettingsItem icon="location-outline" label="Adresses de livraison" />
          <SettingsItem icon="card-outline" label="Moyens de paiement" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          <SettingsItem icon="notifications-outline" label="Notifications push" />
          <SettingsItem icon="language-outline" label="Langue" value="Français" />
          <SettingsItem icon="moon-outline" label="Mode sombre" value="Désactivé" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingsItem icon="help-circle-outline" label="Aide & support" />
          <SettingsItem icon="document-text-outline" label="Conditions d'utilisation" />
          <SettingsItem icon="shield-outline" label="Politique de confidentialité" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <SettingsItem icon="information-circle-outline" label="Version" value="1.0.0" />
        </View>

        <Pressable style={styles.logoutBtn} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={18} color="#C23A2E" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsItem({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string }) {
  return (
    <Pressable style={styles.item}>
      <View style={styles.itemIconWrap}>
        <Ionicons name={icon} size={17} color={colors.ink} />
      </View>
      <Text style={styles.itemLabel}>{label}</Text>
      {value ? (
        <Text style={styles.itemValue}>{value}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={16} color={colors.inkFaint} />
      )}
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
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: typography.display.fontFamily,
    fontSize: 20,
    color: colors.ink,
  },

  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 13,
    color: colors.inkFaint,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 10,
  },
  itemIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.redSofter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    flex: 1,
    fontFamily: typography.bodySemibold.fontFamily,
    fontSize: 14,
    color: colors.ink,
  },
  itemValue: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: colors.inkFaint,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    paddingVertical: 14,
    ...shadow.soft,
  },
  logoutText: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 14.5,
    color: '#C23A2E',
  },
});
