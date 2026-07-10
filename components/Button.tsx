import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { colors, radius, shadow, typography } from '../constants/theme';

type Variant = 'primary' | 'outline' | 'ghost' | 'dark';
type Size = 'md' | 'lg';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading,
  disabled,
  icon,
  style,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        variant === 'primary' && styles.primary,
        variant === 'dark' && styles.dark,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        variant === 'primary' && !isDisabled && shadow.floating,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.red : colors.white}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              (variant === 'outline' || variant === 'ghost') && styles.labelDark,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    gap: 8,
  },
  lg: { paddingVertical: 17, paddingHorizontal: 28 },
  md: { paddingVertical: 12, paddingHorizontal: 20 },
  primary: { backgroundColor: colors.red },
  dark: { backgroundColor: colors.ink },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  ghost: { backgroundColor: colors.redSoft },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.5 },
  label: {
    color: colors.white,
    fontFamily: typography.bodySemibold.fontFamily,
    fontSize: 15.5,
    letterSpacing: 0.2,
  },
  labelDark: { color: colors.ink },
});
