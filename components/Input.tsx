import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors, radius, typography } from '../constants/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
};

export default function Input({ label, error, icon, isPassword, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(!!isPassword);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? colors.red : colors.inkFaint}
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          placeholderTextColor={colors.inkFaint}
          style={styles.input}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={secure}
          autoCapitalize="none"
          {...rest}
        />
        {isPassword && (
          <Ionicons
            name={secure ? 'eye-outline' : 'eye-off-outline'}
            size={19}
            color={colors.inkFaint}
            onPress={() => setSecure((s) => !s)}
            suppressHighlighting
          />
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  label: {
    fontFamily: typography.bodySemibold.fontFamily,
    fontSize: 13,
    color: colors.ink,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    height: 54,
  },
  fieldFocused: { borderColor: colors.red },
  fieldError: { borderColor: '#C23A2E' },
  input: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: 15.5,
    color: colors.ink,
  },
  errorText: {
    marginTop: 6,
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 12.5,
    color: '#C23A2E',
  },
});
