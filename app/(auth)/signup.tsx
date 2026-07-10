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
  View,
} from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Logo from '../../components/Logo';
import { colors, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({});

  const onSubmit = async () => {
    const nextErrors: { name?: string; email?: string; password?: string; form?: string } = {};
    if (!name) nextErrors.name = 'Saisissez votre nom complet.';
    if (!email) nextErrors.email = "L'email est requis.";
    if (!password) nextErrors.password = 'Créez un mot de passe.';
    else if (password.length < 6) nextErrors.password = 'Utilisez au moins 6 caractères.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const res = await signup(name, email, password);
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.cream }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backBtn} onPress={goBack} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>

        <View style={styles.hero}>
          <Logo size={52} />
          <Text style={styles.title}>Rejoignez BuonaFortuna</Text>
          <Text style={styles.subtitle}>
            Créez un compte pour chiner chez nos vendeuses —{'\n'}ou ouvrez votre propre boutique en quelques minutes.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nom complet"
            icon="person-outline"
            placeholder="Alexia Marchand"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />
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
            placeholder="Au moins 6 caractères"
            isPassword
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />

          {!!errors.form && <Text style={styles.formError}>{errors.form}</Text>}

          <Text style={styles.terms}>
            En continuant, vous acceptez les Conditions d'utilisation et la Politique de confidentialité de BuonaFortuna.
          </Text>

          <Button label="Créer mon compte" onPress={onSubmit} loading={isLoading} style={{ marginTop: 6 }} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ?</Text>
          <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8}>
            <Text style={styles.footerLink}> Se connecter</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 26, paddingTop: 8, paddingBottom: 32 },
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
    fontSize: 28,
    color: colors.ink,
    marginTop: 18,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  form: { width: '100%' },
  formError: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: '#C23A2E',
    marginBottom: 10,
    marginTop: -6,
  },
  terms: {
    fontFamily: typography.body.fontFamily,
    fontSize: 11.5,
    color: colors.inkFaint,
    lineHeight: 16,
    marginBottom: 18,
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
