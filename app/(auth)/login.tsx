import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Logo from '../../components/Logo';
import { colors, radius, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isSmall = width < 380;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const onSubmit = async () => {
    const nextErrors: typeof errors = {};
    if (!email) nextErrors.email = "L'email est requis.";
    if (!password) nextErrors.password = 'Le mot de passe est requis.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const res = await login(email, password);
    if (!res.success) {
      setErrors({ form: res.error });
      return;
    }
    router.replace('/(tabs)');
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const horizontalPadding = isSmall ? 20 : 28;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.cream }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backBtn} onPress={goBack} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>

        <View style={styles.hero}>
          <Logo size={isSmall ? 42 : 52} />
          <Text style={[styles.title, isSmall && styles.titleSmall]}>Bon retour</Text>
          <Text style={[styles.subtitle, isSmall && styles.subtitleSmall]}>
            Connectez-vous à BuonaFortuna pour retrouver{'\n'}vos friperies favorites.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            icon="mail-outline"
            placeholder="vous@exemple.com"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />
          <Input
            label="Mot de passe"
            icon="lock-closed-outline"
            placeholder="••••••••"
            isPassword
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />

          {!!errors.form && <Text style={styles.formError}>{errors.form}</Text>}

          <Pressable style={styles.forgot} hitSlop={8}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </Pressable>

          <Button label="Se connecter" onPress={onSubmit} loading={isLoading} style={{ marginTop: 8 }} />

          <View style={styles.hintBox}>
            <Ionicons name="information-circle-outline" size={16} color={colors.inkFaint} />
            <Text style={styles.hintText}>
              Mode démo — n&apos;importe quel email/mot de passe vous connecte en tant que vendeuse.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Nouveau sur BuonaFortuna ?</Text>
          <Pressable onPress={() => router.push('/(auth)/signup')} hitSlop={8}>
            <Text style={styles.footerLink}> Créer un compte</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingTop: 8, paddingBottom: 32 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  hero: { alignItems: 'center', marginTop: 18, marginBottom: 30 },
  title: {
    fontFamily: typography.display.fontFamily,
    fontSize: 30,
    color: colors.ink,
    marginTop: 18,
  },
  titleSmall: { fontSize: 26 },
  subtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  subtitleSmall: { fontSize: 13, lineHeight: 18 },
  form: { width: '100%' },
  formError: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: '#C23A2E',
    marginBottom: 10,
    marginTop: -6,
  },
  forgot: { alignSelf: 'flex-end', marginBottom: 6, marginTop: -8 },
  forgotText: {
    fontFamily: typography.bodySemibold.fontFamily,
    fontSize: 12.5,
    color: colors.red,
  },
  hintBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 18,
    alignItems: 'flex-start',
  },
  hintText: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: 11.5,
    color: colors.inkFaint,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 36,
  },
  footerText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13.5,
    color: colors.inkSoft,
  },
  footerLink: {
    fontFamily: typography.bodyBold.fontFamily,
    fontSize: 13.5,
    color: colors.red,
  },
});
